"""
skin_type.py — AI Skin Type Detection API
Uses image analysis heuristics (color, brightness, saturation) to estimate skin type.
"""

import io
import numpy as np
from PIL import Image
from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter(prefix="/api", tags=["skin-type"])


SKIN_TYPE_INFO = {
    "oily": {
        "type": "Oily",
        "icon": "💧",
        "description": "Your skin shows characteristics of an oily type — higher shine, larger-looking pores, and a tendency toward excess sebum production.",
        "characteristics": [
            "Visible shine, especially in T-zone",
            "Enlarged pores",
            "Prone to blackheads and acne",
            "Makeup tends to slide off",
        ],
        "care_tips": [
            "Use oil-free, non-comedogenic products",
            "Cleanse twice daily with a gentle foaming cleanser",
            "Use lightweight, water-based moisturizers",
            "Apply clay masks weekly to absorb excess oil",
            "Don't skip moisturizer — dehydrated oily skin overproduces oil",
        ],
        "recommended_ingredients": ["Salicylic Acid", "Niacinamide", "Hyaluronic Acid", "Clay", "Tea Tree Oil"],
        "avoid_ingredients": ["Heavy oils (coconut oil)", "Lanolin", "Petroleum-based products"],
    },
    "dry": {
        "type": "Dry",
        "icon": "🏜️",
        "description": "Your skin appears dry — it may feel tight, rough, or flaky, with reduced natural oil production.",
        "characteristics": [
            "Tight, rough, or flaky skin",
            "Barely visible pores",
            "Dull complexion",
            "Prone to fine lines and irritation",
        ],
        "care_tips": [
            "Use cream-based, hydrating cleansers",
            "Apply rich moisturizers with ceramides",
            "Use face oils for extra hydration",
            "Avoid hot water when washing face",
            "Use a humidifier in dry environments",
        ],
        "recommended_ingredients": ["Ceramides", "Hyaluronic Acid", "Squalane", "Shea Butter", "Glycerin"],
        "avoid_ingredients": ["Alcohol-based toners", "Harsh sulfates", "Retinoids (without guidance)"],
    },
    "combination": {
        "type": "Combination",
        "icon": "⚖️",
        "description": "Your skin shows characteristics of a combination type — oily in some areas (typically T-zone) and dry in others.",
        "characteristics": [
            "Oily T-zone (forehead, nose, chin)",
            "Normal to dry cheeks",
            "Medium-sized pores",
            "Occasional breakouts in oily areas",
        ],
        "care_tips": [
            "Use different products for different zones",
            "Lightweight gel moisturizer for T-zone",
            "Richer cream for cheeks and dry areas",
            "Use gentle, pH-balanced cleansers",
            "Multi-masking: clay mask on T-zone, hydrating mask on cheeks",
        ],
        "recommended_ingredients": ["Niacinamide", "Green Tea", "Jojoba Oil", "Aloe Vera", "Witch Hazel"],
        "avoid_ingredients": ["Heavy creams on T-zone", "Harsh exfoliants"],
    },
    "normal": {
        "type": "Normal",
        "icon": "✨",
        "description": "Your skin appears balanced — well-hydrated with minimal excess oil or dryness.",
        "characteristics": [
            "Even skin tone and texture",
            "Small, barely visible pores",
            "Minimal blemishes",
            "Comfortable, not too dry or oily",
        ],
        "care_tips": [
            "Maintain with gentle daily cleansing",
            "Use a balanced moisturizer",
            "Apply SPF daily for protection",
            "Use antioxidant serums for prevention",
            "Gentle exfoliation 1-2 times per week",
        ],
        "recommended_ingredients": ["Vitamin C", "Hyaluronic Acid", "SPF", "Peptides", "Antioxidants"],
        "avoid_ingredients": ["Overly harsh or stripping products"],
    },
    "sensitive": {
        "type": "Sensitive",
        "icon": "🌸",
        "description": "Your skin appears sensitive — it may show redness, irritation, or react easily to products.",
        "characteristics": [
            "Redness and flushing",
            "Reacts to many products",
            "Stinging or burning sensation",
            "Prone to rashes and irritation",
        ],
        "care_tips": [
            "Use fragrance-free, hypoallergenic products",
            "Patch test new products before use",
            "Avoid hot water and harsh scrubs",
            "Use mineral sunscreen instead of chemical",
            "Keep routine minimal and consistent",
        ],
        "recommended_ingredients": ["Aloe Vera", "Chamomile", "Oat Extract", "Centella Asiatica", "Zinc Oxide"],
        "avoid_ingredients": ["Fragrances", "Essential oils", "Alcohol", "Retinoids", "AHA/BHA (without guidance)"],
    },
}


def analyze_skin_type(image: Image.Image) -> dict:
    """
    Analyze skin type from an image using color and texture heuristics.

    Methodology:
    1. Convert to multiple color spaces for analysis
    2. Analyze brightness distribution (dry skin tends darker/less reflective)
    3. Analyze color variance (oily skin has more highlight variance)
    4. Analyze redness channels (sensitive skin shows more red)
    5. Analyze saturation patterns
    """
    # Resize for consistent analysis
    img = image.resize((256, 256))
    img_array = np.array(img, dtype=np.float32)

    # Split channels
    r, g, b = img_array[:, :, 0], img_array[:, :, 1], img_array[:, :, 2]

    # 1. Brightness (perceived luminance)
    brightness = 0.299 * r + 0.587 * g + 0.114 * b
    mean_brightness = np.mean(brightness)
    brightness_std = np.std(brightness)

    # 2. Highlight intensity (oily skin has more specular highlights)
    highlight_threshold = mean_brightness + 1.5 * brightness_std
    highlight_ratio = np.sum(brightness > highlight_threshold) / brightness.size

    # 3. Redness analysis (sensitive/rosacea indicator)
    redness = r - (g + b) / 2
    mean_redness = np.mean(redness)
    redness_ratio = np.sum(redness > 30) / redness.size

    # 4. Saturation analysis (convert to HSV-like)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    saturation = np.where(max_c > 0, (max_c - min_c) / max_c, 0)
    mean_saturation = np.mean(saturation)

    # 5. Texture uniformity (standard deviation of local patches)
    patches = []
    patch_size = 32
    for y in range(0, 256 - patch_size, patch_size):
        for x in range(0, 256 - patch_size, patch_size):
            patch = brightness[y:y + patch_size, x:x + patch_size]
            patches.append(np.std(patch))
    texture_variance = np.std(patches) if patches else 0

    # 6. T-zone vs cheek variance analysis (combination indicator)
    h, w = 256, 256
    tzone_region = brightness[0:h // 3, w // 3:2 * w // 3]  # forehead center
    cheek_region = brightness[h // 3:2 * h // 3, :]  # middle band
    tzone_brightness = np.mean(tzone_region)
    cheek_brightness = np.mean(cheek_region)
    zone_difference = abs(tzone_brightness - cheek_brightness)

    # ── Scoring System ──────────────────────────────────────
    scores = {
        "oily": 0.0,
        "dry": 0.0,
        "combination": 0.0,
        "normal": 0.0,
        "sensitive": 0.0,
    }

    # High highlights → oily
    if highlight_ratio > 0.15:
        scores["oily"] += 3.0
    elif highlight_ratio > 0.08:
        scores["oily"] += 1.5
        scores["combination"] += 1.0

    # Low brightness + low saturation → dry
    if mean_brightness < 110:
        scores["dry"] += 2.0
    elif mean_brightness > 170:
        scores["oily"] += 1.5

    # High redness → sensitive
    if redness_ratio > 0.2:
        scores["sensitive"] += 3.0
    elif redness_ratio > 0.1:
        scores["sensitive"] += 1.5

    # Large zone difference → combination
    if zone_difference > 20:
        scores["combination"] += 2.5
    elif zone_difference > 10:
        scores["combination"] += 1.0

    # High texture variance → roughness → dry
    if texture_variance > 25:
        scores["dry"] += 2.0
    elif texture_variance < 10:
        scores["normal"] += 1.5

    # Low saturation → dry
    if mean_saturation < 0.15:
        scores["dry"] += 1.5
    elif mean_saturation < 0.25:
        scores["normal"] += 1.0

    # Moderate everything → normal
    if (0.05 < highlight_ratio < 0.12 and
            120 < mean_brightness < 160 and
            redness_ratio < 0.1 and
            zone_difference < 15):
        scores["normal"] += 3.0

    # Normalize to probabilities
    total = sum(scores.values()) + 1e-6
    probabilities = {k: round(v / total, 3) for k, v in scores.items()}

    # Determine primary type
    primary_type = max(scores, key=scores.get)

    result = {
        "detected_type": primary_type,
        "confidence": probabilities[primary_type],
        "probabilities": probabilities,
        "info": SKIN_TYPE_INFO[primary_type],
        "analysis_details": {
            "mean_brightness": round(float(mean_brightness), 1),
            "highlight_ratio": round(float(highlight_ratio), 4),
            "redness_ratio": round(float(redness_ratio), 4),
            "mean_saturation": round(float(mean_saturation), 4),
            "texture_variance": round(float(texture_variance), 2),
            "zone_difference": round(float(zone_difference), 2),
        },
        "disclaimer": (
            "This skin type assessment uses image analysis heuristics and is an approximation. "
            "For an accurate skin type assessment, please consult a dermatologist. "
            "Factors like lighting, camera quality, and skin products can affect results."
        ),
    }

    return result


@router.post("/skin-type/detect")
async def detect_skin_type(file: UploadFile = File(...)):
    """Detect skin type from an uploaded face/skin image."""
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    allowed = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Accepted: {', '.join(allowed)}")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        result = analyze_skin_type(image)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skin type detection failed: {str(e)}")


@router.get("/skin-type/info/{skin_type}")
async def get_skin_type_info(skin_type: str):
    """Get detailed information about a specific skin type."""
    key = skin_type.lower().strip()
    if key not in SKIN_TYPE_INFO:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown skin type '{skin_type}'. Valid types: {', '.join(SKIN_TYPE_INFO.keys())}"
        )
    return SKIN_TYPE_INFO[key]
