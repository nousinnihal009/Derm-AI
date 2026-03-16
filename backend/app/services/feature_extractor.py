"""
feature_extractor.py — Stage 2: Quantitative Skin Feature Extraction

Extracts 5 CV metrics (erythema, texture, oiliness, hydration, evenness)
from a skin-masked image.  Every raw score is accompanied by a human-readable
interpretation and reference context.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops

# ── Types ────────────────────────────────────────────────────

MetricLevel = Literal["low", "normal", "elevated", "high"]


@dataclass
class SkinMetric:
    key: str
    display_name: str
    score: float                    # 0.0–1.0 raw value
    percentage: int                 # round(score * 100)
    level: MetricLevel
    interpretation: str             # plain-language 1-sentence explanation
    reference_note: str             # context: "normal range is X–Y%"


@dataclass
class FeatureExtractionResult:
    erythema:  SkinMetric
    texture:   SkinMetric
    oiliness:  SkinMetric
    hydration: SkinMetric
    evenness:  SkinMetric


# ── Interpretation Tables ────────────────────────────────────

METRIC_INTERPRETATIONS: dict[str, dict[MetricLevel, tuple[str, str]]] = {
    "erythema": {
        "low":      ("Minimal redness detected",      "Redness levels are within normal range."),
        "normal":   ("Mild redness present",           "Some redness is normal for most skin types."),
        "elevated": ("Moderate redness detected",      "May indicate inflammation, irritation, or sensitivity."),
        "high":     ("Significant redness detected",   "Elevated redness may indicate active inflammation."),
    },
    "texture": {
        "low":      ("Very smooth texture",            "Skin surface appears smooth and even."),
        "normal":   ("Normal skin texture",            "Texture is within typical range."),
        "elevated": ("Slightly uneven texture",        "Some surface irregularity detected."),
        "high":     ("Notably uneven texture",         "Visible surface irregularity or roughness."),
    },
    "oiliness": {
        "low":      ("Low oil production",             "Skin appears dry or low in sebum."),
        "normal":   ("Balanced oil production",        "Oil levels appear within normal range."),
        "elevated": ("Above-average shine detected",   "Moderate sebum production visible."),
        "high":     ("High shine/oiliness detected",   "Elevated surface oil detected in this photo."),
    },
    "hydration": {
        "low":      ("Potentially dehydrated",         "Skin tone uniformity suggests possible dryness."),
        "normal":   ("Hydration appears adequate",     "Luminance uniformity is within normal range."),
        "elevated": ("Good hydration indicators",      "Skin tone uniformity is good."),
        "high":     ("Excellent hydration indicators", "Skin appears well-hydrated in this image."),
    },
    "evenness": {
        "low":      ("Uneven skin tone detected",      "Noticeable color variation across the skin surface."),
        "normal":   ("Mildly uneven tone",             "Some natural color variation present."),
        "elevated": ("Relatively even skin tone",      "Skin tone appears fairly consistent."),
        "high":     ("Very even skin tone",            "Skin tone is highly uniform in this image."),
    },
}


# ── Level Classification ─────────────────────────────────────

def _classify_level(score: float, metric_key: str) -> MetricLevel:
    """
    Different metrics have different 'good' directions.
    For erythema, texture, oiliness: lower is generally better.
    For hydration, evenness: higher is generally better.
    """
    if score < 0.25:
        return "low"
    if score < 0.50:
        return "normal"
    if score < 0.75:
        return "elevated"
    return "high"


def _build_metric(
    key: str,
    display_name: str,
    score: float,
    reference_note: str,
) -> SkinMetric:
    level = _classify_level(score, key)
    _short_label, interpretation = METRIC_INTERPRETATIONS[key][level]
    return SkinMetric(
        key=key,
        display_name=display_name,
        score=score,
        percentage=round(score * 100),
        level=level,
        interpretation=interpretation,
        reference_note=reference_note,
    )


# ── Individual Metric Computations ───────────────────────────

def _compute_erythema(bgr: np.ndarray, skin_mask: np.ndarray) -> float:
    """
    Erythema index using R/G ratio in skin-masked pixels.
    Returns 0.0–1.0 normalized score.
    """
    skin_pixels = skin_mask.astype(bool)
    if skin_pixels.sum() == 0:
        return 0.0

    r = bgr[:, :, 2][skin_pixels].astype(np.float32)
    g = bgr[:, :, 1][skin_pixels].astype(np.float32)

    epsilon = 1e-6
    ei = np.log((r + epsilon) / (g + epsilon))

    # Normalize to 0-1 range (typical range is -0.5 to 1.5)
    normalized = np.clip((ei - (-0.5)) / 2.0, 0.0, 1.0)
    return float(np.mean(normalized))


def _compute_texture(grey: np.ndarray, skin_mask: np.ndarray) -> float:
    """
    GLCM (Gray-Level Co-occurrence Matrix) contrast metric.
    Higher contrast = rougher/more uneven texture.
    Returns 0.0–1.0 normalized score.
    """
    grey_masked = grey.copy()
    grey_masked[skin_mask == 0] = 0

    # Quantize to 64 levels for efficiency
    grey_q = (grey_masked / 4).astype(np.uint8)
    glcm = graycomatrix(
        grey_q,
        distances=[1],
        angles=[0, np.pi / 4, np.pi / 2],
        levels=64,
        symmetric=True,
        normed=True,
    )
    contrast = graycoprops(glcm, "contrast").mean()

    # Normalize: typical range 0-500, cap at 300 for display
    return float(np.clip(contrast / 300.0, 0.0, 1.0))


def _compute_oiliness(bgr: np.ndarray, skin_mask: np.ndarray) -> float:
    """
    Detects specular highlights (high-intensity, low-saturation spots)
    which are reliable indicators of surface sebum/oiliness.
    """
    hsv  = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    grey = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    skin_pixels = skin_mask.astype(bool)
    if skin_pixels.sum() == 0:
        return 0.0

    # Specular highlight: high brightness (V > 220) + low saturation (S < 30)
    specular_mask = (
        (hsv[:, :, 2] > 220) & (hsv[:, :, 1] < 30) & skin_pixels
    )
    specular_ratio = specular_mask.sum() / skin_pixels.sum()

    # Additionally weight by mean brightness variation
    brightness_std = grey[skin_pixels].std() / 128.0

    oiliness = (specular_ratio * 0.7) + (brightness_std * 0.3)
    return float(np.clip(oiliness * 3.0, 0.0, 1.0))


def _compute_hydration(bgr: np.ndarray, skin_mask: np.ndarray) -> float:
    """
    Estimates hydration as inverse of luminance standard deviation
    in skin-masked region.  Hydrated skin = more uniform luminance.
    """
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2Lab)
    L = lab[:, :, 0].astype(np.float32)

    skin_pixels = skin_mask.astype(bool)
    if skin_pixels.sum() == 0:
        return 0.5  # neutral default

    l_values = L[skin_pixels]
    std_normalized = l_values.std() / 128.0
    hydration = 1.0 - np.clip(std_normalized * 2.0, 0.0, 1.0)
    return float(hydration)


def _compute_evenness(bgr: np.ndarray, skin_mask: np.ndarray) -> float:
    """
    Skin tone evenness via standard deviation across all three
    color channels in skin-masked region.  Lower std = more even.
    """
    skin_pixels = skin_mask.astype(bool)
    if skin_pixels.sum() == 0:
        return 0.5

    stds = []
    for channel in range(3):
        ch = bgr[:, :, channel].astype(np.float32)
        stds.append(ch[skin_pixels].std())

    mean_std = float(np.mean(stds))
    # Normalize: std of 0 = perfectly even (1.0), std of 60+ = very uneven (0.0)
    return float(np.clip(1.0 - (mean_std / 60.0), 0.0, 1.0))


# ── Public Extractor Class ───────────────────────────────────

class SkinFeatureExtractor:
    """Stage 2 — extract quantitative skin health metrics from a validated image."""

    def extract(
        self,
        image_bytes: bytes,
        skin_mask: np.ndarray,
    ) -> FeatureExtractionResult:
        nparr = np.frombuffer(image_bytes, np.uint8)
        bgr   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        grey  = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

        return FeatureExtractionResult(
            erythema=_build_metric(
                "erythema", "Redness Level",
                _compute_erythema(bgr, skin_mask),
                "Scores above 60% may indicate active inflammation",
            ),
            texture=_build_metric(
                "texture", "Skin Texture",
                _compute_texture(grey, skin_mask),
                "Scores above 60% indicate surface roughness",
            ),
            oiliness=_build_metric(
                "oiliness", "Oil Production",
                _compute_oiliness(bgr, skin_mask),
                "Based on specular highlight detection in this image",
            ),
            hydration=_build_metric(
                "hydration", "Hydration",
                _compute_hydration(bgr, skin_mask),
                "Estimated from skin tone luminance uniformity",
            ),
            evenness=_build_metric(
                "evenness", "Skin Tone Evenness",
                _compute_evenness(bgr, skin_mask),
                "Measures color consistency across the skin area",
            ),
        )
