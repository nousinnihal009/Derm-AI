"""
vision_arbiter.py — Stage 4: GPT-4o Vision Cross-Validation

When the ResNet50 classifier is uncertain, invokes GPT-4o Vision to
cross-validate the prediction and generate a natural-language assessment.
Falls back gracefully on timeout or API failure.
"""

from __future__ import annotations

import asyncio
import base64
import json
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

from openai import AsyncOpenAI

if TYPE_CHECKING:
    from app.models.prediction import ClassifierResult
    from app.services.feature_extractor import FeatureExtractionResult

# ── Constants ────────────────────────────────────────────────

ARBITER_TIMEOUT_SECONDS = 4.0

SYSTEM_PROMPT = """\
You are a clinical dermatology image analysis assistant.
You will be shown a skin image and given the top 2 predictions from a ResNet50 classifier
with their confidence scores. Your role is to:

1. Validate or override the primary prediction based on what you can visually observe
2. Extract specific visible skin features that support your assessment
3. Generate a professional, non-alarmist skin assessment paragraph

STRICT RULES:
- Never diagnose. Use language like "may suggest", "consistent with", "could indicate"
- Always recommend professional evaluation for anything beyond routine skincare concerns
- If the image quality is too poor to assess, say so explicitly
- Do not comment on the person's appearance beyond clinical skin observations
- Keep the assessment between 2-4 sentences

Respond ONLY with valid JSON matching this exact schema:
{
  "validated_condition": string,
  "confidence_adjustment": "higher" | "same" | "lower",
  "visible_features": string[],
  "assessment_paragraph": string,
  "refer_to_dermatologist": boolean,
  "llm_overrode_resnet": boolean
}
No preamble, no markdown, no explanation outside the JSON.\
"""


# ── Result Container ─────────────────────────────────────────

@dataclass
class ArbiterResult:
    validated_condition:    str
    confidence_adjustment:  str
    visible_features:       list[str] = field(default_factory=list)
    assessment_paragraph:   str = ""
    refer_to_dermatologist: bool = False
    llm_overrode_resnet:    bool = False
    llm_enriched:           bool = False


# ── Prompt Builder ───────────────────────────────────────────

def _build_arbiter_prompt(
    classifier_result: "ClassifierResult",
    features: "FeatureExtractionResult",
) -> str:
    return (
        f"ResNet50 primary prediction: {classifier_result.top_prediction} "
        f"(confidence: {classifier_result.top_confidence:.1%})\n"
        f"Runner-up prediction: {classifier_result.second_prediction} "
        f"(confidence: {classifier_result.second_confidence:.1%})\n\n"
        f"CV metrics from this image:\n"
        f"- Redness level: {features.erythema.level} ({features.erythema.percentage}%)\n"
        f"- Texture roughness: {features.texture.level} ({features.texture.percentage}%)\n"
        f"- Oiliness: {features.oiliness.level} ({features.oiliness.percentage}%)\n\n"
        f"Please validate or override the primary prediction based on what you observe."
    )


# ── Public Arbiter Class ─────────────────────────────────────

class VisionArbiter:
    """Stage 4 — GPT-4o Vision cross-validation with graceful fallback."""

    def __init__(self) -> None:
        self._client = AsyncOpenAI()

    async def arbitrate(
        self,
        image_bytes: bytes,
        classifier_result: "ClassifierResult",
        features: "FeatureExtractionResult",
    ) -> ArbiterResult:

        fallback = ArbiterResult(
            validated_condition=classifier_result.top_prediction,
            confidence_adjustment="same",
            visible_features=[],
            assessment_paragraph=(
                f"Our analysis suggests this may be consistent with "
                f"{classifier_result.top_prediction.replace('_', ' ')}. "
                "For accurate diagnosis and treatment, please consult a dermatologist."
            ),
            refer_to_dermatologist=classifier_result.top_confidence < 0.72,
            llm_overrode_resnet=False,
            llm_enriched=False,
        )

        try:
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            prompt = _build_arbiter_prompt(classifier_result, features)

            response = await asyncio.wait_for(
                self._client.chat.completions.create(
                    model="gpt-4o",
                    max_tokens=500,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{image_b64}",
                                        "detail": "high",
                                    },
                                },
                                {"type": "text", "text": prompt},
                            ],
                        },
                    ],
                ),
                timeout=ARBITER_TIMEOUT_SECONDS,
            )

            raw = response.choices[0].message.content.strip()
            # Strip markdown fences if present
            data = json.loads(raw.replace("```json", "").replace("```", ""))

            return ArbiterResult(
                validated_condition=data["validated_condition"],
                confidence_adjustment=data["confidence_adjustment"],
                visible_features=data.get("visible_features", []),
                assessment_paragraph=data["assessment_paragraph"],
                refer_to_dermatologist=data["refer_to_dermatologist"],
                llm_overrode_resnet=data["llm_overrode_resnet"],
                llm_enriched=True,
            )

        except (asyncio.TimeoutError, Exception):
            return fallback
