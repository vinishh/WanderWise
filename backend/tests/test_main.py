from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI!"}

@app.post("/api/itinerary")
def generate_itinerary(dummy: dict):
    return {"itinerary": "Sample itinerary"}

@app.get("/api/spots")
def get_spots(state: str = None):
    mock_spot = {
        "name": "Grand Canyon",
        "state": state or "Arizona",
        "category": "Nature",
        "image_url": "https://example.com/image.jpg"
    }
    return [mock_spot]



class AddSpotRequest(BaseModel):
    name: str = Field(min_length=1)
    state: str | None = None

@app.post("/api/add-spot")
def add_spot(req: AddSpotRequest):
    if req.name.lower() == "the alamo":  # simulate "already exists"
        return JSONResponse(content={"error": "Spot already exists"}, status_code=409)
    return {"name": req.name, "state": req.state}
