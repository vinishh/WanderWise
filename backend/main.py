from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
print("Supabase URL:", SUPABASE_URL)



from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to call backend (adjust origin in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI!"}

@app.get("/api/spots")
def get_mock_spots(state: str = "California"):
    return [
        {
            "id": "1",
            "name": "Yosemite National Park",
            "state": state,
            "category": "Nature",
            "image": "https://source.unsplash.com/random/400x300/?yosemite",
        },
        {
            "id": "2",
            "name": "Golden Gate Bridge",
            "state": state,
            "category": "Architecture",
            "image": "https://source.unsplash.com/random/400x300/?golden-gate",
        },
    ]

