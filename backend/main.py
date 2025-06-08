
import requests

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

# cred = credentials.Certificate("firebase-admin-key.json")
import json
import os
from firebase_admin import credentials

firebase_key = os.environ.get("FIREBASE_ADMIN_KEY")
cred = credentials.Certificate(json.loads(firebase_key))

firebase_admin.initialize_app(cred)

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase import create_client, Client
import httpx
import openai

# Load environment variables from .env file
load_dotenv()
print("🔑 Loaded Unsplash Key:", os.getenv("UNSPLASH_ACCESS_KEY"))

openai.api_key = os.getenv("OPENAI_API_KEY")






# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Print for sanity check (optional, can be removed later)
print("Supabase URL:", SUPABASE_URL)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Create FastAPI app
app = FastAPI()

# Allow frontend requests from localhost:3000
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],
    # allow_origins=[
    # "http://localhost:3000",
    # "https://wander-wise-c4t2wrzg3-vinishhs-projects.vercel.app"
    # ]
    allow_origins=["*"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test route
@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI!"}

# Spots route – fetches real data from Supabase


@app.get("/api/spots")
def get_spots(state: str = None):
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    url = f"{SUPABASE_URL}/rest/v1/spots"

    # Optional filter by state
    params = {}
    if state:
        params["state"] = f"eq.{state}"

    response = httpx.get(url, headers=headers, params=params)
    data = response.json()
    print("Supabase REST data:", data)
    return JSONResponse(content=data)



from fastapi import Request

@app.post("/api/itinerary")
async def generate_itinerary(request: Request):
    body = await request.json()
    user_input = body.get("query", "California")

#    prompt = f"Create a 3-day travel itinerary for {user_input}, including famous natural and man-made landmarks, food spots, and a short summary for each day."
    prompt = user_input


    try:
        response = openai.ChatCompletion.create(
#            model="gpt-4",  # optionally change to "gpt-3.5-turbo" if needed
	    model="gpt-3.5-turbo",

            messages=[
                {"role": "system", "content": "You are a travel planning assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.7
        )
        ai_reply = response.choices[0].message.content
        return {"itinerary": ai_reply}

    except Exception as e:
        print("❌ OpenAI error:", str(e))  # ← add this to log the real issue
        return {"error": "Something went wrong generating itinerary."}


from fastapi import Request, HTTPException
from supabase import create_client, Client

# Supabase init (you probably already have this somewhere)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.post("/api/visit")
async def mark_spot_visited(request: Request):
    body = await request.json()
    id_token = request.headers.get("Authorization")
    spot_id = body.get("spot_id")

    if not id_token or not spot_id:
        raise HTTPException(status_code=400, detail="Missing token or spot_id")

    try:
        # Verify Firebase ID token
        decoded_token = firebase_auth.verify_id_token(id_token)
        user_id = decoded_token["uid"]
    except Exception as e:
        print("Firebase verification failed:", str(e))
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

    # Save to visited_spots
    try:
        # Optional: check if already visited first
        response = supabase.from_("visited_spots").insert({
            "user_id": user_id,
            "spot_id": spot_id
        }).execute()

        return {"status": "success"}

    except Exception as e:
        print("Supabase insert error:", str(e))
        raise HTTPException(status_code=500, detail="Database insert failed")

@app.get("/api/visited")
async def get_visited_spots(request: Request):
    id_token = request.headers.get("Authorization")
    if not id_token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        user_id = decoded_token["uid"]
    except Exception as e:
        print("Firebase verification failed:", str(e))
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        response = supabase.from_("visited_spots") \
            .select("spot_id") \
            .eq("user_id", user_id) \
            .execute()

        spot_ids = [row["spot_id"] for row in response.data]
        return {"visited": spot_ids}
    except Exception as e:
        print("Supabase fetch error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch visited spots")

from fastapi import Request

@app.get("/api/visited-full")
async def get_visited_full(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return {"error": "Missing token"}

    try:
        decoded = firebase_auth.verify_id_token(auth_header)
        uid = decoded["uid"]
    except Exception as e:
        print("Auth error:", e)
        return {"error": "Invalid token"}

    try:
        # Get visited spot IDs
        visit_res = supabase.table("visited_spots").select("spot_id").eq("user_id", uid).execute()
        spot_ids = [item["spot_id"] for item in visit_res.data]

        # Get full spot data
        if spot_ids:
            spots_res = supabase.table("spots").select("*").in_("id", spot_ids).execute()
            return {"spots": spots_res.data}
        else:
            return {"spots": []}

    except Exception as e:
        print("Supabase error:", e)
        return {"error": "Failed to fetch visited spots."}


@app.delete("/api/visited")
async def clear_visited(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return {"error": "Missing token"}

    try:
        decoded = firebase_auth.verify_id_token(auth_header)
        uid = decoded["uid"]
        print("Clearing visited spots for UID:", uid)
    except Exception as e:
        print("Auth error:", e)
        return {"error": "Invalid token"}

    try:
        delete_res = supabase.table("visited_spots").delete().eq("user_id", uid).execute()
        print("Supabase delete response:", delete_res)
        return {"message": "Visited spots cleared."}
    except Exception as e:
        print("Supabase delete error:", e)
        return {"error": "Failed to clear visited spots."}




@app.get("/api/spot/{spot_id}")
def get_spot_by_id(spot_id: str):
    response = supabase.table("spots").select("*").eq("id", spot_id).single().execute()
    spot = response.data
    if not spot:
        return {"error": "Spot not found"}

    if not spot.get("description"):
        try:
            prompt = f"What makes {spot['name']} in {spot['state']} a special place to visit? Also mention the best time of year to go."
            chat_response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
            )
            description = chat_response.choices[0].message['content'].strip()

            # Save to DB
            supabase.table("spots").update({"description": description}).eq("id", spot_id).execute()
            spot["description"] = description
        except Exception as e:
            print("❌ AI Error:", e)
            spot["description"] = "Description unavailable."

    return spot


from pydantic import BaseModel
from uuid import uuid4

UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

class AddSpotRequest(BaseModel):
    name: str
    state: str | None = None

@app.post("/api/add-spot")
async def add_spot(req: AddSpotRequest):
    name = req.name.strip()
    state = req.state.strip() if req.state else None

    # Check if spot already exists
    existing = supabase.table("spots").select("id").eq("name", name).execute()
    if existing.data and len(existing.data) > 0:
        return JSONResponse({"error": "Spot already exists"}, status_code=409)

    # 🧠 Generate category using OpenAI
    try:
        prompt = f"What category best describes the travel destination: '{name}'? Respond with one word like 'Nature', 'Museum', 'Landmark', 'Park', etc."
        ai_resp = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        category = ai_resp.choices[0].message.content.strip().split()[0]
    except Exception as e:
        print("OpenAI category error:", e)
        category = "Other"

    # 🖼️ Try fetching a real image from Unsplash
    try:
        url = f"https://api.unsplash.com/search/photos?query={name} {state or ''}&per_page=1&client_id={UNSPLASH_ACCESS_KEY}"
        res = requests.get(url)
        res.raise_for_status()
        data = res.json()
        img_url = data["results"][0]["urls"]["regular"]
        photographer = data["results"][0]["user"]["name"]
        photographer_url = data["results"][0]["user"]["links"]["html"]

        # Track Unsplash usage
        download_url = data["results"][0]["links"]["download_location"]
        requests.get(f"{download_url}&client_id={UNSPLASH_ACCESS_KEY}")

    except Exception as e:
        print("Unsplash error:", e)
        img_url = "https://source.unsplash.com/600x400/?travel"
        photographer = None
        photographer_url = None

    # 🧾 Insert into Supabase
    spot_data = {
        "id": str(uuid4()),
        "name": name,
        "state": state,
        "category": category,
        "image_url": img_url,
        "photographer": photographer,
        "photographer_url": photographer_url,
    }

    supabase.table("spots").insert(spot_data).execute()
    return spot_data


from uuid import uuid4
from fastapi import Request

@app.post("/api/save-itinerary")
async def save_itinerary(request: Request):
    body = await request.json()
    id_token = request.headers.get("Authorization")
    query = body.get("query")
    itinerary = body.get("itinerary")

    if not id_token or not query or not itinerary:
        raise HTTPException(status_code=400, detail="Missing data")

    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        user_id = decoded_token["uid"]
    except Exception as e:
        print("Auth error:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        supabase.table("saved_itineraries").insert({
            "id": str(uuid4()),
            "user_id": user_id,
            "query": query,
            "itinerary": itinerary
        }).execute()

        return {"message": "Itinerary saved!"}
    except Exception as e:
        print("Insert error:", e)
        raise HTTPException(status_code=500, detail="Failed to save itinerary")


@app.delete("/api/delete-itinerary")
async def delete_itinerary(request: Request):
    body = await request.json()
    id_token = request.headers.get("Authorization")
    itinerary_id = body.get("id")

    if not id_token or not itinerary_id:
        raise HTTPException(status_code=400, detail="Missing data")

    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        user_id = decoded_token["uid"]
    except Exception as e:
        print("Auth error:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        supabase.table("saved_itineraries").delete() \
            .eq("id", itinerary_id).eq("user_id", user_id).execute()
        return {"message": "Itinerary deleted!"}
    except Exception as e:
        print("Delete error:", e)
        raise HTTPException(status_code=500, detail="Failed to delete itinerary")


@app.get("/api/saved-itineraries")
async def get_saved_itineraries(request: Request):
    id_token = request.headers.get("Authorization")
    if not id_token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        decoded = firebase_auth.verify_id_token(id_token)
        uid = decoded["uid"]
    except Exception as e:
        print("Auth error:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        res = supabase.table("saved_itineraries") \
            .select("id, query, itinerary, created_at") \
            .eq("user_id", uid) \
            .order("created_at", desc=True) \
            .execute()
        return {"itineraries": res.data}
    except Exception as e:
        print("Fetch error:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch saved itineraries")
