"""
weather.py — Weather context service for skincare-relevant environmental data.
Integrates with Open-Meteo API to fetch real-time climate information.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

import httpx
from pydantic import BaseModel, Field


class WeatherContext(BaseModel):
    """Pydantic model for weather context relevant to skincare advice."""
    temperature_c: float = Field(description="Current temperature in Celsius")
    humidity_pct: float = Field(description="Relative humidity percentage")
    uv_index: float = Field(description="Current UV index")
    condition: str = Field(description="Human-readable weather condition")
    is_humid: bool = Field(description="Whether conditions are considered humid (>60%)")


async def get_weather_context(lat: float, lon: float) -> WeatherContext:
    """
    Fetch current weather context for the given coordinates.
    Uses Open-Meteo free API (no API key required).

    Args:
        lat: Latitude of the user's location
        lon: Longitude of the user's location

    Returns:
        WeatherContext with temperature, humidity, UV index, and condition.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,weather_code,uv_index",
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    current = data.get("current", {})
    temperature = current.get("temperature_2m", 25.0)
    humidity = current.get("relative_humidity_2m", 50.0)
    uv_index = current.get("uv_index", 0.0)
    weather_code = current.get("weather_code", 0)

    condition = _weather_code_to_condition(weather_code)

    return WeatherContext(
        temperature_c=temperature,
        humidity_pct=humidity,
        uv_index=uv_index,
        condition=condition,
        is_humid=humidity > 60.0,
    )


def _weather_code_to_condition(code: int) -> str:
    """Convert WMO weather code to a human-readable condition string."""
    mapping = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    }
    return mapping.get(code, "Unknown conditions")
