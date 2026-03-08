"""
chatbot.py

AI Dermatologist Chatbot — rule-based Q&A system with fuzzy matching
using the dermatology knowledge base.
"""

from difflib import get_close_matches
from app.services.knowledge_base import CONDITION_DATABASE, INGREDIENT_DATABASE, check_ingredient_safety

# ─────────────────────────────────────────────────────────────
# Pre-built Q&A Knowledge
# ─────────────────────────────────────────────────────────────

GENERAL_QA = {
    "melanoma": {
        "keywords": ["melanoma", "melanoma dangerous", "deadliest skin cancer", "most dangerous"],
        "response": (
            "**Melanoma** is the most dangerous form of skin cancer. It develops from melanocytes (pigment cells) and can "
            "metastasize to other organs if not caught early.\n\n"
            "**Key facts:**\n"
            "- 5-year survival rate: **99% if localized** (Stage I), drops to **30% if metastasized**\n"
            "- Use the **ABCDE rule** to check moles: Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolving\n"
            "- Risk factors: intense UV exposure, fair skin, >50 moles, family history\n\n"
            "⚠️ **If you suspect melanoma, see a dermatologist IMMEDIATELY.** Early detection saves lives."
        )
    },
    "eczema_treatment": {
        "keywords": ["treatment for eczema", "eczema treatment", "treat eczema", "cure eczema", "help eczema"],
        "response": (
            "**Eczema (Atopic Dermatitis) Treatment:**\n\n"
            "**Daily Management:**\n"
            "- Moisturize **immediately after bathing** (within 3 minutes)\n"
            "- Use thick, fragrance-free creams (CeraVe, Vanicream, Eucerin)\n"
            "- Take short lukewarm showers (<10 min)\n"
            "- Use gentle, fragrance-free cleansers\n\n"
            "**Flare Treatments:**\n"
            "- OTC: 1% hydrocortisone cream (max 2 weeks)\n"
            "- Prescription: Topical corticosteroids, tacrolimus, pimecrolimus\n"
            "- Severe cases: Dupilumab (Dupixent) biologic therapy\n\n"
            "**Lifestyle:**\n"
            "- Identify and avoid triggers (stress, allergens, irritants)\n"
            "- Wear soft cotton clothing\n"
            "- Use a humidifier in dry weather\n\n"
            "⚠️ Eczema has no cure, but can be well-managed. See a dermatologist if OTC treatments aren't enough."
        )
    },
    "see_doctor": {
        "keywords": ["should i see a doctor", "when to see doctor", "see a dermatologist", "need doctor", "should i go to doctor"],
        "response": (
            "**When to See a Dermatologist:**\n\n"
            "🔴 **Immediately if:**\n"
            "- A mole is changing (ABCDE criteria)\n"
            "- A sore that won't heal\n"
            "- A rapidly growing lesion\n"
            "- Signs of skin infection (spreading redness, warmth, pus, fever)\n\n"
            "🟡 **Soon if:**\n"
            "- Persistent rash >2 weeks\n"
            "- Severe acne causing scarring\n"
            "- Widespread skin condition\n"
            "- OTC treatments aren't working after 6-8 weeks\n\n"
            "🟢 **Routine (schedule when convenient):**\n"
            "- Annual skin cancer screening (especially if >50 moles or family history)\n"
            "- Mild cosmetic concerns\n"
            "- New skincare routine guidance\n\n"
            "💡 **Tip:** Many dermatologists now offer teledermatology (video consultations) for initial assessments."
        )
    },
    "sunscreen": {
        "keywords": ["sunscreen", "spf", "sun protection", "uv protection", "sunblock"],
        "response": (
            "**Sunscreen Guide:**\n\n"
            "- Use **SPF 30 minimum** (SPF 50 recommended for daily use)\n"
            "- Choose **broad-spectrum** (protects against UVA + UVB)\n"
            "- Apply **1/4 teaspoon for face** (most people under-apply)\n"
            "- Reapply **every 2 hours** outdoors, or after swimming/sweating\n\n"
            "**Types:**\n"
            "- **Mineral** (zinc oxide, titanium dioxide): Best for sensitive/acne-prone skin\n"
            "- **Chemical** (avobenzone, octinoxate): More cosmetically elegant, lighter feel\n\n"
            "**Key facts:**\n"
            "- UV damage is the #1 cause of premature aging\n"
            "- Up to 80% of UV rays penetrate clouds\n"
            "- SPF only measures UVB protection — look for broad-spectrum\n"
            "- Sunscreen is the **single most important anti-aging product**"
        )
    },
    "acne": {
        "keywords": ["acne", "pimple", "breakout", "zits", "acne treatment"],
        "response": (
            "**Acne Treatment Guide:**\n\n"
            "**Mild Acne (blackheads, whiteheads):**\n"
            "- Salicylic acid 2% cleanser\n"
            "- Adapalene 0.1% gel (Differin — now OTC)\n"
            "- Benzoyl peroxide 2.5% spot treatment\n\n"
            "**Moderate Acne (papules, pustules):**\n"
            "- Add benzoyl peroxide wash\n"
            "- Consider prescription retinoid\n"
            "- Topical antibiotics (clindamycin)\n\n"
            "**Severe/Cystic Acne:**\n"
            "- See a dermatologist — may need isotretinoin (Accutane)\n"
            "- Cortisone injections for painful cysts\n"
            "- Hormonal therapy (spironolactone for hormonal acne)\n\n"
            "**Important tips:**\n"
            "- Don't pick or pop — causes scarring\n"
            "- Be patient — most treatments take 6-12 weeks\n"
            "- Always use sunscreen with retinoids"
        )
    },
    "skin_cancer": {
        "keywords": ["skin cancer", "cancer", "cancerous", "malignant", "is it cancer"],
        "response": (
            "**Skin Cancer Overview:**\n\n"
            "**Three main types:**\n"
            "1. **Basal Cell Carcinoma (BCC)** — Most common, slowest growing, rarely spreads\n"
            "2. **Squamous Cell Carcinoma (SCC)** — Can metastasize if neglected\n"
            "3. **Melanoma** — Most dangerous, can be fatal if not caught early\n\n"
            "**Warning signs (ABCDE rule for moles):**\n"
            "- **A**symmetry — one half doesn't match the other\n"
            "- **B**order — irregular, ragged, or blurred edges\n"
            "- **C**olor — uneven color (brown, black, red, white, blue)\n"
            "- **D**iameter — larger than 6mm (pencil eraser)\n"
            "- **E**volving — changing in size, shape, or color\n\n"
            "**Prevention:**\n"
            "- Daily SPF 50+ sunscreen\n"
            "- Avoid tanning beds (increases melanoma risk by 75%)\n"
            "- Wear protective clothing\n"
            "- Monthly self-exams + annual dermatologist screening\n\n"
            "⚠️ **Any suspicious lesion should be evaluated by a dermatologist ASAP.**"
        )
    },
    "retinol": {
        "keywords": ["retinol", "retinoid", "retin-a", "tretinoin", "vitamin a"],
        "response": (
            "**Retinol/Retinoid Guide:**\n\n"
            "Retinoids are Vitamin A derivatives — the **gold standard** for anti-aging and acne.\n\n"
            "**Strength hierarchy (weakest → strongest):**\n"
            "1. Retinyl palmitate (very mild)\n"
            "2. Retinol 0.3-1% (OTC)\n"
            "3. Adapalene 0.1-0.3% (OTC/Rx)\n"
            "4. Tretinoin 0.025-0.1% (prescription)\n"
            "5. Tazarotene (strongest Rx)\n\n"
            "**How to use:**\n"
            "- Start LOW and SLOW (2x/week, increase gradually)\n"
            "- Apply pea-sized amount to DRY skin at night\n"
            "- Always use SPF 50+ during the day\n"
            "- Expect initial 'purging' (weeks 2-6) — this is normal\n"
            "- Results visible after 12-24 weeks\n\n"
            "**Avoid with:** other exfoliants (AHA/BHA), vitamin C (use in AM instead), benzoyl peroxide"
        )
    },
    "dry_skin": {
        "keywords": ["dry skin", "dehydrated skin", "dry face", "flaky skin", "cracked skin"],
        "response": (
            "**Dry Skin Care Guide:**\n\n"
            "**Hydrating routine:**\n"
            "1. Gentle cream cleanser (no foaming/SLS)\n"
            "2. Hyaluronic acid serum on DAMP skin\n"
            "3. Rich moisturizer with ceramides\n"
            "4. Facial oil to seal (squalane, jojoba)\n"
            "5. SPF 30+ (cream-based, not alcohol-based)\n\n"
            "**Key ingredients:**\n"
            "- Hyaluronic acid — draws water to skin\n"
            "- Ceramides — repair skin barrier\n"
            "- Glycerin — humectant\n"
            "- Squalane — lightweight oil\n"
            "- Shea butter — rich emollient\n\n"
            "**Avoid:**\n"
            "- Harsh cleansers (SLS, SLES)\n"
            "- Hot water (use lukewarm)\n"
            "- Over-exfoliating\n"
            "- Alcohol-based toners"
        )
    },
    "oily_skin": {
        "keywords": ["oily skin", "oily face", "excess oil", "shiny skin", "greasy skin", "sebum"],
        "response": (
            "**Oily Skin Care Guide:**\n\n"
            "**Daily routine:**\n"
            "1. Gentle foaming/gel cleanser (AM & PM)\n"
            "2. Niacinamide 10% serum — regulates sebum production\n"
            "3. Lightweight gel or water-cream moisturizer\n"
            "4. Oil-free SPF 50 or mineral sunscreen\n\n"
            "**Key ingredients:**\n"
            "- Niacinamide — sebum regulation, pore minimizing\n"
            "- Salicylic acid (BHA) — penetrates and clears pores\n"
            "- Zinc — anti-inflammatory, controls oil\n"
            "- Clay masks — absorb excess oil (1-2x/week)\n\n"
            "**Common mistakes:**\n"
            "- Over-cleansing (strips oil → skin produces MORE)\n"
            "- Skipping moisturizer (dehydration ≠ oily)\n"
            "- Using harsh/drying products\n\n"
            "💡 **Tip:** Oily skin ages slower due to natural lipid protection. Embrace it!"
        )
    },
    "sensitive_skin": {
        "keywords": ["sensitive skin", "skin irritation", "redness", "burning", "stinging", "reactive skin"],
        "response": (
            "**Sensitive Skin Care Guide:**\n\n"
            "**Golden rules:**\n"
            "1. Patch test EVERY new product (behind ear or inner forearm, 48 hours)\n"
            "2. Introduce ONE product at a time (wait 2 weeks)\n"
            "3. Keep routine MINIMAL (fewer products = fewer reactions)\n\n"
            "**Safe ingredients:**\n"
            "- Centella asiatica (cica) — soothing\n"
            "- Ceramides — barrier repair\n"
            "- Panthenol (vitamin B5) — calming\n"
            "- Colloidal oatmeal — anti-itch, protective\n"
            "- Aloe vera — cooling, hydrating\n\n"
            "**AVOID:**\n"
            "- Fragrance/parfum (top allergen)\n"
            "- Essential oils\n"
            "- Alcohol denat (drying)\n"
            "- SLS/SLES surfactants\n"
            "- High-concentration actives\n\n"
            "⚠️ If your skin is suddenly sensitive, it may be a damaged barrier. Simplify routine to cleanser + moisturizer + SPF for 4-6 weeks."
        )
    },
    "anti_aging": {
        "keywords": ["anti aging", "anti-aging", "wrinkles", "fine lines", "aging skin", "look younger"],
        "response": (
            "**Evidence-Based Anti-Aging Guide:**\n\n"
            "**The Big 3 (proven by research):**\n"
            "1. **Sunscreen SPF 50+** — prevents 80% of visible aging\n"
            "2. **Retinoids** — stimulate collagen, reduce wrinkles\n"
            "3. **Vitamin C** — antioxidant, brightening, collagen boost\n\n"
            "**Supporting players:**\n"
            "- Peptides — signal collagen production\n"
            "- Hyaluronic acid — plumping hydration\n"
            "- Niacinamide — improves elasticity\n"
            "- AHAs (glycolic/lactic acid) — gentle resurfacing\n\n"
            "**Lifestyle factors:**\n"
            "- Sleep 7-9 hours (skin repairs overnight)\n"
            "- Don't smoke (accelerates aging 10+ years)\n"
            "- Reduce sugar (glycation damages collagen)\n"
            "- Stay hydrated\n"
            "- Manage stress\n\n"
            "**Professional treatments:**\n"
            "- Microneedling — stimulates collagen\n"
            "- Chemical peels — resurfacing\n"
            "- Botox — prevents dynamic wrinkles\n"
            "- Laser treatments — collagen remodeling\n\n"
            "💡 **Prevention > Treatment.** Start sunscreen early, add retinol in your late 20s."
        )
    },
    "skincare_routine": {
        "keywords": ["skincare routine", "skin routine", "how to start skincare", "basic routine", "beginner skincare", "what products"],
        "response": (
            "**Beginner Skincare Routine:**\n\n"
            "**Morning (3 steps):**\n"
            "1. **Cleanser** — Gentle, pH-balanced (5.5)\n"
            "2. **Moisturizer** — Matches your skin type\n"
            "3. **Sunscreen SPF 30-50** — Non-negotiable!\n\n"
            "**Evening (3 steps):**\n"
            "1. **Cleanser** — Remove sunscreen/makeup (double cleanse if needed)\n"
            "2. **Treatment** — Active (retinol, vitamin C, or niacinamide)\n"
            "3. **Moisturizer** — Slightly richer than AM\n\n"
            "**When to add products:**\n"
            "- Start with the basics for 4 weeks\n"
            "- Add ONE active at a time\n"
            "- Wait 2 weeks between new products\n"
            "- Listen to your skin\n\n"
            "**By skin type:**\n"
            "- Oily → gel cleanser, lightweight moisturizer\n"
            "- Dry → cream cleanser, rich moisturizer\n"
            "- Sensitive → fragrance-free everything\n"
            "- Combination → different products for different zones"
        )
    },
    "psoriasis": {
        "keywords": ["psoriasis", "psoriatic", "scaly patches", "plaque psoriasis", "scalp psoriasis"],
        "response": (
            "**Psoriasis Guide:**\n\n"
            "Psoriasis is a chronic autoimmune condition where skin cells grow too fast (3-4 days vs. 28-30 days normally).\n\n"
            "**Types:**\n"
            "- **Plaque** (most common, 80%) — thick, red, silvery patches\n"
            "- **Guttate** — small drop-shaped spots, often triggered by strep\n"
            "- **Inverse** — smooth red patches in skin folds\n"
            "- **Pustular** — pus-filled bumps\n"
            "- **Erythrodermic** — widespread, red, life-threatening (rare)\n\n"
            "**Treatment options:**\n"
            "- **Mild:** topical steroids, vitamin D analogs, coal tar\n"
            "- **Moderate:** phototherapy (UVB), methotrexate\n"
            "- **Severe:** biologics (adalimumab, secukinumab, etc.)\n\n"
            "**Important:**\n"
            "- Psoriasis is NOT contagious\n"
            "- 30% of patients develop psoriatic arthritis — watch for joint pain\n"
            "- Higher risk of cardiovascular disease\n"
            "- Stress is a major trigger\n\n"
            "⚠️ See a dermatologist for proper diagnosis and management plan."
        )
    },
    "fungal": {
        "keywords": ["fungal", "ringworm", "athlete's foot", "jock itch", "fungal infection", "tinea", "yeast infection"],
        "response": (
            "**Fungal Skin Infections Guide:**\n\n"
            "**Common types:**\n"
            "- **Tinea corporis** (ringworm) — ring-shaped rash\n"
            "- **Tinea pedis** (athlete's foot) — itchy, flaking feet\n"
            "- **Tinea cruris** (jock itch) — groin area\n"
            "- **Tinea capitis** (scalp) — requires ORAL treatment\n"
            "- **Candidiasis** — yeast in warm, moist skin folds\n\n"
            "**Treatment:**\n"
            "- OTC: clotrimazole or terbinafine cream (2-4 weeks)\n"
            "- Apply antifungal BEYOND rash edges\n"
            "- Continue 1-2 weeks AFTER rash clears\n"
            "- Keep area clean and DRY\n\n"
            "**Prevention:**\n"
            "- Wear breathable fabrics\n"
            "- Change socks daily\n"
            "- Don't share towels/clothing\n"
            "- Dry thoroughly after showers\n"
            "- Treat pets if they're the source\n\n"
            "⚠️ See a doctor if: covers large area, involves scalp/nails, or doesn't improve after 2 weeks."
        )
    },
    "dark_spots": {
        "keywords": ["dark spots", "hyperpigmentation", "melasma", "dark marks", "sun spots", "age spots", "brown spots"],
        "response": (
            "**Dark Spots / Hyperpigmentation Guide:**\n\n"
            "**Types:**\n"
            "- **PIH** (Post-Inflammatory) — after acne, injury\n"
            "- **Melasma** — hormonal, patches on cheeks/forehead\n"
            "- **Sun spots** — from UV damage\n\n"
            "**Best ingredients (ranked by evidence):**\n"
            "1. **Sunscreen SPF 50** — THE most important (prevents new/worsening spots)\n"
            "2. **Vitamin C 15-20%** — antioxidant + melanin inhibitor\n"
            "3. **Niacinamide 10%** — blocks melanin transfer\n"
            "4. **Azelaic acid 15-20%** — safe in pregnancy\n"
            "5. **Alpha arbutin** — gentle alternative to hydroquinone\n"
            "6. **Retinoids** — accelerate cell turnover\n"
            "7. **Tranexamic acid** — especially effective for melasma\n\n"
            "**Timeline:** Expect 3-6 months for noticeable improvement.\n\n"
            "⚠️ **Critical:** Without daily SPF 50+, NO brightening treatment will work. UV constantly triggers new pigment."
        )
    },
    "scarring": {
        "keywords": ["scar", "scarring", "acne scars", "skin scar", "scar treatment", "remove scar"],
        "response": (
            "**Scar Treatment Guide:**\n\n"
            "**Types of acne scars:**\n"
            "- **Ice pick** — deep, narrow holes\n"
            "- **Boxcar** — wide, rectangular depressions\n"
            "- **Rolling** — wave-like undulations\n"
            "- **Hypertrophic/keloid** — raised, thickened scars\n\n"
            "**At-home treatments:**\n"
            "- Retinol/tretinoin — improves texture over months\n"
            "- Vitamin C — supports collagen\n"
            "- AHA exfoliants — gentle resurfacing\n"
            "- Silicone sheets/gel — for raised scars\n"
            "- SPF 50 — prevents scar darkening\n\n"
            "**Professional treatments:**\n"
            "- **Microneedling** — best for rollling/boxcar scars\n"
            "- **Fractional laser** — powerful resurfacing\n"
            "- **TCA CROSS** — for ice pick scars\n"
            "- **Subcision** — releases tethered scars\n"
            "- **Dermal fillers** — temporary volume for depressed scars\n\n"
            "💡 OTC products help with discoloration but cannot fix textural scars. Professional treatments are the gold standard."
        )
    },
    "greeting": {
        "keywords": ["hello", "hi", "hey", "help", "what can you do", "what do you know"],
        "response": (
            "Hello! 👋 I'm your AI Dermatology Assistant. I can help you with:\n\n"
            "🔬 **Skin conditions** — Information about acne, eczema, psoriasis, skin cancer, and more\n"
            "💊 **Treatments** — Treatment options for various skin conditions\n"
            "🧴 **Skincare routines** — Personalized routine guidance\n"
            "🧪 **Ingredient safety** — Check if skincare ingredients are safe\n"
            "👨‍⚕️ **When to see a doctor** — Guidance on when to seek professional help\n"
            "☀️ **Sun protection** — SPF and UV protection advice\n\n"
            "Just ask me a question! For example:\n"
            "- \"Is melanoma dangerous?\"\n"
            "- \"What treatments exist for eczema?\"\n"
            "- \"Should I see a doctor?\"\n"
            "- \"How to treat dark spots?\"\n"
            "- \"What's a good beginner skincare routine?\"\n\n"
            "⚠️ *I'm an AI assistant, not a doctor. Always consult a healthcare professional for medical advice.*"
        )
    }
}


def _fuzzy_match_condition(text: str) -> str | None:
    """Try to fuzzy-match a user query to a condition in the database."""
    text_lower = text.lower()

    # Build list of all matchable names
    names = []
    for class_name, info in CONDITION_DATABASE.items():
        names.append(class_name.lower())
        names.append(info["display_name"].lower())

    matches = get_close_matches(text_lower, names, n=1, cutoff=0.5)
    if matches:
        matched = matches[0]
        for class_name, info in CONDITION_DATABASE.items():
            if matched == class_name.lower() or matched == info["display_name"].lower():
                return class_name
    return None


def get_chatbot_response(message: str) -> dict:
    """Generate a chatbot response based on the user's message."""
    msg_lower = message.lower().strip()

    # Check general Q&A first (keyword matching with scoring)
    best_match = None
    best_score = 0
    for qa_id, qa in GENERAL_QA.items():
        for keyword in qa["keywords"]:
            if keyword in msg_lower:
                score = len(keyword)
                if score > best_score:
                    best_score = score
                    best_match = qa

    if best_match:
        return {
            "response": best_match["response"],
            "type": "knowledge",
            "disclaimer": "This information is for educational purposes only and not a substitute for professional medical advice."
        }

    # Check if asking about a specific condition (exact match)
    for class_name, info in CONDITION_DATABASE.items():
        display_lower = info["display_name"].lower()
        class_lower = class_name.lower()
        if class_lower in msg_lower or display_lower in msg_lower:
            return _build_condition_response(class_name, info)

    # Fuzzy match for conditions
    fuzzy_match = _fuzzy_match_condition(msg_lower)
    if fuzzy_match:
        info = CONDITION_DATABASE[fuzzy_match]
        return _build_condition_response(fuzzy_match, info)

    # Check if asking about an ingredient
    ingredient_keywords = ["ingredient", "safe", "harmful", "contain", "chemical", "is it safe", "can i use"]
    if any(kw in msg_lower for kw in ingredient_keywords):
        for ing_name in INGREDIENT_DATABASE.keys():
            if ing_name in msg_lower:
                info = check_ingredient_safety(ing_name)
                safety_emoji = "✅" if info["safety"] == "safe" else "⚠️" if info["safety"] == "caution" else "🚫"
                response = (
                    f"{safety_emoji} **{ing_name.title()}** — Safety: **{info['safety'].title()}**\n\n"
                    f"{info['description']}\n\n"
                    f"- Acne risk: {'Yes' if info['acne_risk'] else 'No'}\n"
                    f"- Allergen risk: {'Yes' if info['allergen_risk'] else 'No'}"
                )
                return {
                    "response": response,
                    "type": "ingredient_info",
                    "disclaimer": "Consult INCIDecoder.com or a dermatologist for comprehensive ingredient analysis."
                }

    # Check for treatment-related questions
    treatment_keywords = ["treatment", "treat", "cure", "heal", "remedy", "medicine", "medication", "how to get rid"]
    if any(kw in msg_lower for kw in treatment_keywords):
        # Try to find a condition in the message
        for class_name, info in CONDITION_DATABASE.items():
            display_lower = info["display_name"].lower()
            # Check partial matches
            display_words = display_lower.split()
            if any(word in msg_lower for word in display_words if len(word) > 3):
                treatments = info.get("treatments", {})
                response = f"**Treatment Options for {info['display_name']}:**\n\n"
                if treatments.get("otc"):
                    response += "**Over-the-Counter:**\n" + "\n".join(f"- {t}" for t in treatments["otc"]) + "\n\n"
                if treatments.get("prescription"):
                    response += "**Prescription:**\n" + "\n".join(f"- {t}" for t in treatments["prescription"]) + "\n\n"
                if treatments.get("natural"):
                    response += "**Natural/Supportive:**\n" + "\n".join(f"- {t}" for t in treatments["natural"]) + "\n\n"
                response += f"**When to see a doctor:** {info.get('when_to_see_doctor', 'Consult a dermatologist for persistent concerns.')}"
                return {
                    "response": response,
                    "type": "treatment_info",
                    "disclaimer": "Never self-medicate. Always consult a healthcare professional before starting any treatment."
                }

    # Default response with helpful suggestions
    return {
        "response": (
            "I'm not sure I understand that question. Here are some things I can help with:\n\n"
            "- **Skin conditions**: Ask about acne, eczema, melanoma, psoriasis, rosacea, fungal infections, etc.\n"
            "- **Treatments**: \"What treatments exist for [condition]?\"\n"
            "- **When to see a doctor**: \"Should I see a doctor?\"\n"
            "- **Ingredients**: \"Is [ingredient name] safe?\"\n"
            "- **Skincare**: \"How do I care for dry/oily skin?\"\n"
            "- **Anti-aging**: \"What are the best anti-aging ingredients?\"\n"
            "- **Dark spots**: \"How to treat hyperpigmentation?\"\n"
            "- **Routines**: \"What is a good beginner skincare routine?\"\n\n"
            "Try rephrasing your question or ask about a specific condition!"
        ),
        "type": "fallback",
        "disclaimer": "I'm an AI assistant. For medical concerns, please consult a healthcare professional."
    }


def _build_condition_response(class_name: str, info: dict) -> dict:
    """Build a formatted response for a skin condition."""
    response = (
        f"**{info['display_name']}**\n\n"
        f"{info['description']}\n\n"
        f"**Severity:** {info['severity'].title()}\n"
        f"**Risk Level:** {info['risk_level'].title()}\n\n"
    )
    if info.get("causes"):
        response += f"**Common causes:** {', '.join(info['causes'][:4])}\n\n"
    if info.get("symptoms"):
        response += f"**Symptoms:** {', '.join(info['symptoms'][:4])}\n\n"
    response += f"**When to see a doctor:** {info['when_to_see_doctor']}\n\n"

    if info.get("is_cancerous"):
        response += "⚠️ **This is a form of skin cancer. Please seek immediate medical evaluation.**\n"

    return {
        "response": response,
        "type": "condition_info",
        "condition": class_name,
        "disclaimer": "This information is for educational purposes only and not a substitute for professional medical advice."
    }
