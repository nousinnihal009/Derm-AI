"""
aging.py — Skin Aging Prediction & AI Cosmetic Simulation API
Provides aging risk assessment, UV damage analysis, and skin health timeline.
(Full generative simulation requires StyleGAN — this provides analytical predictions
with actionable, data-driven insights.)
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api", tags=["aging"])


class AgingAssessmentRequest(BaseModel):
    age: int = 30
    skin_type: str = "normal"
    sun_exposure: str = "moderate"  # low, moderate, high
    smoking: bool = False
    detected_condition: Optional[str] = None
    uv_index: Optional[float] = None
    humidity: Optional[float] = None


AGING_FACTORS = {
    "uv_exposure": {
        "icon": "☀️",
        "name": "UV Exposure",
        "weight": 0.35,
        "description": "Ultraviolet radiation is the #1 cause of premature skin aging (photoaging), responsible for up to 80% of visible facial aging.",
    },
    "oxidative_stress": {
        "icon": "🌫️",
        "name": "Oxidative Stress",
        "weight": 0.20,
        "description": "Pollution, stress, and environmental toxins generate free radicals that break down collagen and elastin.",
    },
    "hydration": {
        "icon": "💧",
        "name": "Hydration Level",
        "weight": 0.15,
        "description": "Chronically dehydrated skin loses elasticity and shows premature fine lines and wrinkles.",
    },
    "lifestyle": {
        "icon": "🍎",
        "name": "Lifestyle Factors",
        "weight": 0.15,
        "description": "Diet, sleep, smoking, and alcohol consumption significantly impact skin health and aging rate.",
    },
    "genetics": {
        "icon": "🧬",
        "name": "Genetic Predisposition",
        "weight": 0.15,
        "description": "Intrinsic aging is largely determined by genetics — including collagen density, melanin levels, and skin thickness.",
    },
}


def compute_aging_score(data: AgingAssessmentRequest) -> dict:
    """Compute a comprehensive skin aging risk score and timeline."""

    # Base aging factors
    risk_factors = []
    total_risk = 0.0

    # 1. UV Exposure risk
    sun_risk = {"low": 0.2, "moderate": 0.5, "high": 0.85}.get(data.sun_exposure, 0.5)
    if data.uv_index is not None:
        if data.uv_index >= 8:
            sun_risk = max(sun_risk, 0.9)
        elif data.uv_index >= 6:
            sun_risk = max(sun_risk, 0.7)
    uv_score = sun_risk * AGING_FACTORS["uv_exposure"]["weight"]
    total_risk += uv_score
    risk_factors.append({
        **AGING_FACTORS["uv_exposure"],
        "score": round(sun_risk, 2),
        "level": "High" if sun_risk > 0.7 else "Moderate" if sun_risk > 0.4 else "Low",
        "recommendation": (
            "Apply SPF 50+ broad-spectrum sunscreen daily. Wear UV-protective clothing and wide-brimmed hats. "
            "Seek shade between 10am-4pm." if sun_risk > 0.4 else
            "Continue daily SPF 30+ protection."
        ),
    })

    # 2. Oxidative stress
    oxidative_risk = 0.4  # baseline
    if data.detected_condition and "melanoma" in data.detected_condition.lower():
        oxidative_risk = 0.8
    elif data.smoking:
        oxidative_risk = 0.75
    ox_score = oxidative_risk * AGING_FACTORS["oxidative_stress"]["weight"]
    total_risk += ox_score
    risk_factors.append({
        **AGING_FACTORS["oxidative_stress"],
        "score": round(oxidative_risk, 2),
        "level": "High" if oxidative_risk > 0.6 else "Moderate" if oxidative_risk > 0.3 else "Low",
        "recommendation": (
            "Use antioxidant serums (Vitamin C, Vitamin E, Niacinamide). "
            "Consider anti-pollution skincare products." if oxidative_risk > 0.3 else
            "Maintain antioxidant-rich diet and skincare."
        ),
    })

    # 3. Hydration
    hydration_risk = 0.3
    if data.skin_type == "dry":
        hydration_risk = 0.7
    elif data.skin_type == "combination":
        hydration_risk = 0.45
    if data.humidity is not None and data.humidity < 30:
        hydration_risk = max(hydration_risk, 0.6)
    hyd_score = hydration_risk * AGING_FACTORS["hydration"]["weight"]
    total_risk += hyd_score
    risk_factors.append({
        **AGING_FACTORS["hydration"],
        "score": round(hydration_risk, 2),
        "level": "High" if hydration_risk > 0.6 else "Moderate" if hydration_risk > 0.35 else "Low",
        "recommendation": (
            "Use hyaluronic acid serums, ceramide-rich moisturizers, and drink 8+ glasses of water daily. "
            "Consider a humidifier for dry environments." if hydration_risk > 0.35 else
            "Continue regular hydration routine."
        ),
    })

    # 4. Lifestyle
    lifestyle_risk = 0.3
    if data.smoking:
        lifestyle_risk = 0.85
    if data.age > 50:
        lifestyle_risk = max(lifestyle_risk, 0.55)
    life_score = lifestyle_risk * AGING_FACTORS["lifestyle"]["weight"]
    total_risk += life_score
    risk_factors.append({
        **AGING_FACTORS["lifestyle"],
        "score": round(lifestyle_risk, 2),
        "level": "High" if lifestyle_risk > 0.6 else "Moderate" if lifestyle_risk > 0.35 else "Low",
        "recommendation": (
            "Quit smoking (reversal begins within weeks). Sleep 7-9 hours. "
            "Eat antioxidant-rich foods (berries, leafy greens, fish)." if lifestyle_risk > 0.5 else
            "Maintain balanced diet, regular exercise, and adequate sleep."
        ),
    })

    # 5. Genetics (estimated from age + skin type)
    genetic_risk = 0.3
    if data.age > 40:
        genetic_risk += 0.2
    if data.skin_type == "dry":
        genetic_risk += 0.15
    gen_score = min(genetic_risk, 1.0) * AGING_FACTORS["genetics"]["weight"]
    total_risk += gen_score
    risk_factors.append({
        **AGING_FACTORS["genetics"],
        "score": round(min(genetic_risk, 1.0), 2),
        "level": "High" if genetic_risk > 0.6 else "Moderate" if genetic_risk > 0.35 else "Low",
        "recommendation": (
            "Focus on preventive care: retinoids, peptides, and regular dermatologist check-ups." if genetic_risk > 0.35 else
            "Continue preventive skincare routine."
        ),
    })

    # Overall score (0–1)
    overall_score = min(total_risk, 1.0)

    # Predicted skin age offset
    age_offset = int(overall_score * 15)  # 0-15 years offset
    predicted_skin_age = data.age + age_offset

    # Timeline predictions
    timeline = []
    current_age = data.age
    for delta in [0, 5, 10, 20]:
        future_age = current_age + delta
        collagen_loss = min(1.0 - (0.01 * future_age), 1.0)  # ~1% per year after 20
        elastin_loss = min(1.0 - (0.008 * max(future_age - 25, 0)), 1.0)
        uv_damage = min(sun_risk * 0.03 * delta, 1.0)

        if overall_score < 0.3:
            skin_quality = "Excellent" if delta == 0 else "Very Good" if delta <= 5 else "Good"
        elif overall_score < 0.5:
            skin_quality = "Good" if delta == 0 else "Fair" if delta <= 10 else "Moderate"
        else:
            skin_quality = "Fair" if delta == 0 else "Moderate" if delta <= 5 else "Aging"

        timeline.append({
            "age": future_age,
            "years_from_now": delta,
            "predicted_quality": skin_quality,
            "collagen_retention": round(max(collagen_loss, 0) * 100, 1),
            "elastin_retention": round(max(elastin_loss, 0) * 100, 1),
            "cumulative_uv_damage": round(uv_damage * 100, 1),
        })

    # Determine overall aging category
    if overall_score < 0.25:
        category = "Minimal"
        category_desc = "Your skin shows minimal signs of accelerated aging. Keep up your current routine!"
    elif overall_score < 0.45:
        category = "Moderate"
        category_desc = "Some risk factors are present. Targeted interventions can slow premature aging."
    elif overall_score < 0.65:
        category = "Elevated"
        category_desc = "Multiple risk factors contributing to accelerated aging. Consider professional dermatology consultation."
    else:
        category = "High"
        category_desc = "Significant aging risk factors detected. Immediate lifestyle and skincare changes recommended."

    # Top 3 anti-aging recommendations
    anti_aging_plan = [
        {
            "priority": 1,
            "action": "Daily SPF 50+ sunscreen application",
            "impact": "Prevents 80% of photoaging",
            "icon": "🛡️",
        },
        {
            "priority": 2,
            "action": "Retinoid use (start low, 0.025%)",
            "impact": "Boosts collagen production, reduces wrinkles by 30-50%",
            "icon": "💫",
        },
        {
            "priority": 3,
            "action": "Vitamin C serum (morning routine)",
            "impact": "Neutralizes free radicals, brightens skin, stimulates collagen",
            "icon": "🍊",
        },
        {
            "priority": 4,
            "action": "Hyaluronic acid + ceramide moisturizer",
            "impact": "Restores barrier function and deep hydration",
            "icon": "💧",
        },
        {
            "priority": 5,
            "action": "Regular professional skin assessments",
            "impact": "Early detection of sun damage and skin cancer",
            "icon": "👨‍⚕️",
        },
    ]

    return {
        "overall_score": round(overall_score, 3),
        "category": category,
        "category_description": category_desc,
        "actual_age": data.age,
        "predicted_skin_age": predicted_skin_age,
        "age_offset": age_offset,
        "risk_factors": risk_factors,
        "timeline": timeline,
        "anti_aging_plan": anti_aging_plan,
        "disclaimer": (
            "This aging prediction uses heuristic models and is NOT a clinical assessment. "
            "Actual skin aging depends on many factors including genetics, hormones, and health conditions. "
            "For accurate skin aging evaluation, consult a dermatologist."
        ),
    }


@router.post("/aging/predict")
async def predict_aging(data: AgingAssessmentRequest):
    """Predict skin aging trajectory and provide personalized anti-aging plan."""
    if data.age < 10 or data.age > 120:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Age must be between 10 and 120")
    return compute_aging_score(data)
