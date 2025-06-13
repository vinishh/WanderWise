import openai
import os
import time
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API keys
openai.api_key = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

# Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# All 50 US states
all_states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming"
]

# Step 1: Generate 10 must-visit spots using OpenAI
def generate_spots(state: str):
    prompt = (
        f"List 10 must-visit travel spots in {state}, USA. "
        f"Return a JSON list of 10 objects, each with a 'name' and 'category' (e.g., Natural, Man-made, Historical, etc.). "
        f"Example: [{{'name': 'Grand Canyon', 'category': 'Natural'}}, ...]"
    )
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        content = response['choices'][0]['message']['content']
        spots = eval(content)
        return spots if isinstance(spots, list) else []
    except Exception as e:
        print(f"❌ OpenAI error for {state}: {e}")
        return []

# Step 2: Get Unsplash image with UTM attribution
def get_unsplash_image(query: str):
    try:
        print(f"🔍 Searching Unsplash for: {query}")
        url = f"https://api.unsplash.com/search/photos?query={query} travel destination&per_page=1&order_by=relevant&client_id={UNSPLASH_ACCESS_KEY}"
        res = requests.get(url)
        res.raise_for_status()
        data = res.json()
        results = data.get("results")

        if results:
            img = results[0]
            # Download tracking
            requests.get(f"{img['links']['download_location']}&client_id={UNSPLASH_ACCESS_KEY}")

            username = img["user"]["username"]
            name = img["user"]["name"]
            photographer_url = f"https://unsplash.com/@{username}?utm_source=wanderwise&utm_medium=referral"

            return {
                "image_url": img["urls"]["regular"],
                "photographer": name,
                "photographer_url": photographer_url
            }

    except Exception as e:
        print(f"❌ Unsplash error for '{query}': {e}")

    # Fallback with proper attribution
    return {
        "image_url": "https://source.unsplash.com/600x400/?landmark,nature",
        "photographer": "Unsplash",
        "photographer_url": "https://unsplash.com/?utm_source=wanderwise&utm_medium=referral"
    }

# Step 3: Insert into Supabase
def insert_spot(spot, state):
    try:
        img_data = get_unsplash_image(f"{spot['name']} {state}")

        supabase.table("spots").insert({
            "name": spot["name"],
            "state": state,
            "category": spot["category"],
            "image_url": img_data["image_url"],
            "photographer": img_data["photographer"],
            "photographer_url": img_data["photographer_url"]
        }).execute()

        print(f"✅ Inserted: {spot['name']} in {state}")
    except Exception as e:
        print(f"❌ Failed to insert spot in {state}: {e}")

# Run for all states
if __name__ == "__main__":
    for state in all_states:
        print(f"\n🌎 Seeding 10 iconic spots for {state}...")
        spots = generate_spots(state)
        for spot in spots:
            insert_spot(spot, state)
            time.sleep(1)
