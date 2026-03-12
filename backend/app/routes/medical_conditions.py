"""
medical_conditions.py — API routes for the Medical Skin Conditions Advisor module.
Endpoints:
  POST /api/medical/protocol          → Generate a condition care protocol
  GET  /api/medical/conditions        → List all 18 supported conditions
  GET  /api/medical/conditions/{key}  → Preview a single condition
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Request, Depends

from app.services.condition_advisor import (
    ConditionAdvisorEngine,
    ConditionRequest,
    ConditionResponse,
)
from app.utils.rate_limit import create_rate_limiter

logger = logging.getLogger("dermai.medical_conditions")

router = APIRouter(prefix="/api/medical", tags=["medical-conditions"])

# Rate limit: 15 requests/minute for protocol generation
_protocol_rate_limit = create_rate_limiter(limit=15, window_seconds=60)

# Module-level engine singleton
_engine = ConditionAdvisorEngine()

# ── Valid condition keys (validated at the router level) ───
_VALID_KEYS = {
    "atopic_dermatitis", "contact_dermatitis", "rosacea",
    "seborrheic_dermatitis", "psoriasis", "lichen_planus",
    "perioral_dermatitis", "fungal_acne", "ringworm", "warts",
    "molluscum_contagiosum", "impetigo", "cold_sores",
    "vitiligo", "melasma", "post_inflammatory_hyperpigmentation",
    "actinic_keratosis", "melanoma_risk",
}


# =====================================================================
# POST /api/medical/protocol
# =====================================================================


@router.post(
    "/protocol",
    response_model=ConditionResponse,
    summary="Generate a medical condition care protocol",
    description="Accepts a condition intake form and returns a personalized care protocol.",
)
async def generate_protocol(
    request: ConditionRequest,
    _rate: None = Depends(_protocol_rate_limit),
) -> ConditionResponse:
    """Generate a full care protocol for the given condition + intake."""

    # Validate condition key
    if request.condition not in _VALID_KEYS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown condition key: {request.condition}. "
                   f"Valid keys: {', '.join(sorted(_VALID_KEYS))}",
        )

    try:
        response = await _engine.generate_protocol(request)
        logger.info("Protocol generated for condition=%s severity=%s",
                     request.condition, request.severity)
        return response
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Protocol generation failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error during protocol generation.")


# =====================================================================
# GET /api/medical/conditions
# =====================================================================


@router.get(
    "/conditions",
    response_model=list[dict[str, Any]],
    summary="List all supported skin conditions",
    description="Returns summary data for all 18 supported conditions.",
)
async def list_conditions() -> list[dict[str, Any]]:
    """List all supported conditions with summary metadata."""
    try:
        return _engine.list_all_conditions()
    except Exception as e:
        logger.exception("Failed to list conditions: %s", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve conditions list.")


# =====================================================================
# GET /api/medical/conditions/{key}
# =====================================================================


@router.get(
    "/conditions/{key}",
    response_model=dict[str, Any],
    summary="Get preview data for a single condition",
    description="Returns education preview, triggers, and red flags for a condition.",
)
async def get_condition_preview(key: str) -> dict[str, Any]:
    """Get a preview of a single condition for the selection UI."""
    if key not in _VALID_KEYS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown condition key: {key}. "
                   f"Valid keys: {', '.join(sorted(_VALID_KEYS))}",
        )

    try:
        return _engine.get_condition_preview(key)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Condition not found: {key}")
    except Exception as e:
        logger.exception("Failed to get condition preview: %s", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve condition preview.")
