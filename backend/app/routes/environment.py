"""
environment.py — Environmental Skin Risk Alerts API
Uses the free Open-Meteo API for real weather data (no API key needed).
Falls back to user-provided or default values if the API is unavailable.
"""

import httpx
from fastapi import APIRouter
from typing import Optional

router = APIRouter(prefix="/api", tags=["environment"])


# UV Index risk levels
UV_RISK_LEVELS = {
    (0, 2): {"level": "Low", "color": "green", "advice": "Minimal protection needed. Wear sunglasses."},
    (3, 5): {"level": "Moderate", "color": "yellow", "advice": "Wear SPF 30+ sunscreen, hat, and sunglasses. Seek shade during midday."},
    (6, 7): {"level": "High", "color": "orange", "advice": "Wear SPF 50+ sunscreen, protective clothing, and wide-brim hat. Avoid midday sun."},
    (8, 10): {"level": "Very High", "color": "red", "advice": "Take ALL precautions. SPF 50+ required. Stay indoors 10am-4pm if possible."},
    (11, 15): {"level": "Extreme", "color": "purple", "advice": "AVOID ALL outdoor exposure during peak hours. Maximum protection essential."},
}


# Simple geocoding for major cities worldwide
CITY_COORDS = {
    "new york": (40.7128, -74.0060),
    "los angeles": (34.0522, -118.2437),
    "chicago": (41.8781, -87.6298),
    "houston": (29.7604, -95.3698),
    "san francisco": (37.7749, -122.4194),
    "seattle": (47.6062, -122.3321),
    "miami": (25.7617, -80.1918),
    "boston": (42.3601, -71.0589),
    "london": (51.5074, -0.1278),
    "paris": (48.8566, 2.3522),
    "tokyo": (35.6762, 139.6503),
    "sydney": (-33.8688, 151.2093),
    "mumbai": (19.0760, 72.8777),
    "delhi": (28.6139, 77.2090),
    "dubai": (25.2048, 55.2708),
    "berlin": (52.5200, 13.4050),
    "toronto": (43.6532, -79.3832),
    "singapore": (1.3521, 103.8198),
    "hyderabad": (17.3850, 78.4867),
    "bangalore": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "kolkata": (22.5726, 88.3639),
    "pune": (18.5204, 73.8567),
}


def get_uv_risk(uv_index: float) -> dict:
    for (low, high), info in UV_RISK_LEVELS.items():
        if low <= uv_index <= high:
            return info
    return UV_RISK_LEVELS[(8, 10)]


async def fetch_weather_data(lat: float, lon: float) -> dict:
    """Fetch real-time weather data from the free Open-Meteo API."""
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,uv_index"
        f"&timezone=auto"
    )
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            current = data.get("current", {})
            return {
                "uv_index": current.get("uv_index"),
                "humidity": current.get("relative_humidity_2m"),
                "temperature": current.get("temperature_2m"),
                "source": "live",
            }
    except Exception as e:
        print(f"Open-Meteo API fetch failed: {e}")
        return {"source": "fallback"}


async def fetch_air_quality(lat: float, lon: float) -> dict:
    """Fetch air quality from the free Open-Meteo Air Quality API."""
    url = (
        f"https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={lat}&longitude={lon}"
        f"&current=us_aqi"
    )
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            current = data.get("current", {})
            return {
                "aqi": current.get("us_aqi"),
                "source": "live",
            }
    except Exception as e:
        print(f"Air Quality API fetch failed: {e}")
        return {"source": "fallback"}


@router.get("/environment/risks")
async def get_environment_risks(
    city: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    uv_index: Optional[float] = None,
    humidity: Optional[float] = None,
    pollution_aqi: Optional[int] = None,
    temperature: Optional[float] = None,
):
    """
    Get environmental skin risk alerts.

    Priority:
    1. If city is given, resolve to lat/lon and fetch real data from Open-Meteo
    2. If lat/lon are given, fetch real data from Open-Meteo
    3. If explicit values are given, use those
    4. Otherwise, use safe defaults
    """

    data_source = "defaults"
    resolved_lat = lat
    resolved_lon = lon

    # Resolve city to coordinates
    if city:
        city_lower = city.lower().strip()
        if city_lower in CITY_COORDS:
            resolved_lat, resolved_lon = CITY_COORDS[city_lower]

    # Fetch real data if we have coordinates
    if resolved_lat is not None and resolved_lon is not None:
        weather = await fetch_weather_data(resolved_lat, resolved_lon)
        air = await fetch_air_quality(resolved_lat, resolved_lon)

        if weather.get("source") == "live":
            data_source = "live"
            if uv_index is None and weather.get("uv_index") is not None:
                uv_index = weather["uv_index"]
            if humidity is None and weather.get("humidity") is not None:
                humidity = weather["humidity"]
            if temperature is None and weather.get("temperature") is not None:
                temperature = weather["temperature"]

        if air.get("source") == "live":
            if pollution_aqi is None and air.get("aqi") is not None:
                pollution_aqi = int(air["aqi"])

    # Final defaults
    if uv_index is None:
        uv_index = 6.0
    if humidity is None:
        humidity = 50.0
    if pollution_aqi is None:
        pollution_aqi = 50
    if temperature is None:
        temperature = 25.0

    # Build risk assessment
    risks = []

    # UV Risk
    uv_risk = get_uv_risk(uv_index)
    risks.append({
        "type": "UV Radiation",
        "value": round(uv_index, 1),
        "unit": "UV Index",
        "level": uv_risk["level"],
        "color": uv_risk["color"],
        "advice": uv_risk["advice"],
        "icon": "☀️"
    })

    # Humidity Risk
    if humidity < 30:
        risks.append({
            "type": "Low Humidity",
            "value": round(humidity, 1),
            "unit": "%",
            "level": "Warning",
            "color": "orange",
            "advice": "Low humidity can dry out skin. Use a heavier moisturizer and consider a humidifier.",
            "icon": "💧"
        })
    elif humidity > 80:
        risks.append({
            "type": "High Humidity",
            "value": round(humidity, 1),
            "unit": "%",
            "level": "Moderate",
            "color": "yellow",
            "advice": "High humidity may worsen acne and fungal conditions. Use lightweight, oil-free products.",
            "icon": "💧"
        })
    else:
        risks.append({
            "type": "Humidity",
            "value": round(humidity, 1),
            "unit": "%",
            "level": "Normal",
            "color": "green",
            "advice": "Humidity levels are comfortable for skin health.",
            "icon": "💧"
        })

    # Air Quality
    if pollution_aqi > 150:
        aqi_level = "Unhealthy"
        aqi_color = "red"
        aqi_advice = "High pollution accelerates skin aging and can worsen conditions. Double cleanse in the evening. Use antioxidant serum (Vitamin C)."
    elif pollution_aqi > 100:
        aqi_level = "Moderate-High"
        aqi_color = "orange"
        aqi_advice = "Moderate pollution levels. Use antioxidant protection and cleanse thoroughly at night."
    elif pollution_aqi > 50:
        aqi_level = "Moderate"
        aqi_color = "yellow"
        aqi_advice = "Some pollution present. Standard skincare routine with cleansing is sufficient."
    else:
        aqi_level = "Good"
        aqi_color = "green"
        aqi_advice = "Air quality is good. Standard skincare routine."

    risks.append({
        "type": "Air Quality",
        "value": pollution_aqi,
        "unit": "AQI",
        "level": aqi_level,
        "color": aqi_color,
        "advice": aqi_advice,
        "icon": "🌫️"
    })

    # Temperature
    if temperature > 35:
        risks.append({
            "type": "Heat",
            "value": round(temperature, 1),
            "unit": "°C",
            "level": "High",
            "color": "red",
            "advice": "Extreme heat increases sweating and sun damage risk. Stay hydrated, use lightweight SPF, and cool showers.",
            "icon": "🌡️"
        })
    elif temperature < 5:
        risks.append({
            "type": "Cold",
            "value": round(temperature, 1),
            "unit": "°C",
            "level": "Warning",
            "color": "blue",
            "advice": "Cold weather strips moisture from skin. Use heavier moisturizers and protect exposed skin.",
            "icon": "🌡️"
        })
    else:
        risks.append({
            "type": "Temperature",
            "value": round(temperature, 1),
            "unit": "°C",
            "level": "Normal",
            "color": "green",
            "advice": "Temperature is comfortable for skin health.",
            "icon": "🌡️"
        })

    # Overall recommendation
    high_risks = [r for r in risks if r["color"] in ("red", "purple")]
    if high_risks:
        overall = "⚠️ High environmental skin risk today. Take extra precautions with sun protection and skincare."
    else:
        overall = "✅ Environmental conditions are generally safe for skin health today."

    return {
        "risks": risks,
        "overall": overall,
        "data_source": data_source,
        "location": city if city else (f"{resolved_lat},{resolved_lon}" if resolved_lat else "default"),
        "disclaimer": "Environmental data is fetched from Open-Meteo (free API). For critical decisions, check local weather services."
    }
