import os
import httpx
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("DEFAULT_LLM_API_KEY")
BASE_URL = os.getenv("DEFAULT_LLM_BASE_URL")
MODEL = os.getenv("TAROT_MODEL")

print(f"API Key: {API_KEY[:5]}...{API_KEY[-5:] if API_KEY else 'None'}")
print(f"Base URL: {BASE_URL}")
print(f"Model: {MODEL}")

async def test_connection():
    if not API_KEY:
        print("Error: API Key is missing.")
        return

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": "Hello, are you working?"}
        ],
        "stream": False
    }

    print("\nSending request...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {response.headers}")
            print(f"Response Body: {response.text}")
            
    except Exception as e:
        print(f"Exception occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
