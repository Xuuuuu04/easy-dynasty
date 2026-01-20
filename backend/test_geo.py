import asyncio
from app.services.location_service import get_coordinates_by_address

async def test():
    print("Testing Geocoding...")
    address = "北京市"
    result = await get_coordinates_by_address(address)
    print(f"Address: {address}")
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(test())
