from fastapi import APIRouter, HTTPException, Query
from app.services.location_service import get_coordinates_by_address
from pydantic import BaseModel

router = APIRouter()

class GeocodeResponse(BaseModel):
    address: str
    longitude: float
    latitude: float

@router.get("/geocode", response_model=GeocodeResponse)
async def geocode_address(address: str = Query(..., min_length=1)):
    """
    Look up coordinates for an address string.
    """
    coords = await get_coordinates_by_address(address)
    if not coords:
        raise HTTPException(status_code=404, detail="Address not found")
    
    return GeocodeResponse(
        address=address,
        longitude=coords[0],
        latitude=coords[1]
    )
