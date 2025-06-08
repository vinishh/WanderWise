import openai
import os
import time
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Env variables
openai.api_key = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

# Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# All 50 states
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

# Step 1: Wipe all existing spots
# def clear_spots():
#     print("🗑️ Deleting all existing spots...")
#     supabase.table("spots").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
#     print("✅ All existing spots removed.\n")


# Step 2: Generate spots via OpenAI
def generate_spots(state: str):
    prompt = f"List 1 must-visit travel spots in {state}, U.S. with name and category (either Natural or Man-made). Return as JSON like: [{{'name': '', 'category': ''}}, ...]"
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        content = response['choices'][0]['message']['content']
        spots = eval(content)
        return spots
    except Exception as e:
        print(f"❌ OpenAI error for {state}: {e}")
        return []

# Step 3: Get Unsplash image
def get_unsplash_image(query: str):
    try:
        print(f"🔍 Searching Unsplash for: {query}")
        url = f"https://api.unsplash.com/search/photos?query={query}&per_page=1&client_id={UNSPLASH_ACCESS_KEY}"
        res = requests.get(url)
        res.raise_for_status()
        data = res.json()
        results = data.get("results")
        if results:
            img_url = results[0]["urls"]["regular"]
            download_url = results[0]["links"]["download_location"]
            photographer = results[0]["user"]["name"]
            photographer_url = results[0]["user"]["links"]["html"]

            # ✅ Trigger Unsplash download tracking
            requests.get(f"{download_url}&client_id={UNSPLASH_ACCESS_KEY}")

            print(f"✅ Found image: {img_url} by {photographer}")
            return {
                "image_url": img_url,
                "photographer": photographer,
                "photographer_url": photographer_url
            }
        else:
            print(f"⚠️ No image found for: {query}")
    except Exception as e:
        print(f"❌ Unsplash error for '{query}': {e}")

    # Return fallback + placeholder attribution
    return {
        "image_url": "https://source.unsplash.com/600x400/?landmark,nature",
        "photographer": "Unsplash",
        "photographer_url": "https://unsplash.com"
    }


# Step 4: Insert spot
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
        print(f"❌ Failed to insert {spot['name']} in {state}: {e}")


# Run everything
if __name__ == "__main__":
    # clear_spots()

    for state in all_states:
        print(f"\n🌍 Seeding 10 spots for {state}...")
        spots = generate_spots(state)
        for spot in spots:
            insert_spot(spot, state)
        time.sleep(1)
