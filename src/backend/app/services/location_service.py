from typing import Optional, Tuple

import httpx

from app.core.config import settings


async def get_coordinates_by_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Call AMap (Gaode) API to convert address to (longitude, latitude).
    Returns None if failed or key not configured.
    """
    if not settings.AMAP_API_KEY:
        print("Warning: AMAP_API_KEY is not set.")
        return None

    url = "https://restapi.amap.com/v3/geocode/geo"
    params = {"key": settings.AMAP_API_KEY, "address": address, "output": "json"}

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, params=params)
            data = resp.json()

            if data.get("status") == "1" and data.get("geocodes"):
                # "location": "116.481488,39.990464"
                location_str = data["geocodes"][0]["location"]
                lng_str, lat_str = location_str.split(",")
                return float(lng_str), float(lat_str)
            else:
                print(f"Geocoding failed: {data.get('info')}")
                return None
        except Exception as e:
            print(f"Error calling map API: {e}")
            return None
