import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))



from fastapi.testclient import TestClient
from test_main import app
import time


client = TestClient(app)

def test_hello_route():
    res = client.get("/api/hello")
    assert res.status_code == 200
    assert res.json() == {"message": "Hello from FastAPI!"}

def test_itinerary_route():
    res = client.post("/api/itinerary", json={"query": "California"})
    assert res.status_code == 200
    assert "itinerary" in res.json()


def test_get_spots_all():
    res = client.get("/api/spots")
    assert res.status_code == 200
    assert isinstance(res.json(), list)  # should return a list of spots


def test_get_spots_by_state():
    res = client.get("/api/spots?state=California")
    assert res.status_code == 200
    assert all("state" in spot for spot in res.json())


def test_add_spot_valid():
    res = client.post("/api/add-spot", json={"name": "The Alamo", "state": "Texas"})
    assert res.status_code in [200, 409]  # 409 = already exists
    assert "name" in res.json() or "error" in res.json()


def test_add_spot_invalid():
    res = client.post("/api/add-spot", json={"name": "", "state": "Texas"})
    assert res.status_code == 422  # validation error


def test_spot_data_integrity():
    res = client.get("/api/spots")
    assert res.status_code == 200
    spots = res.json()
    assert isinstance(spots, list)
    
    for spot in spots:
        assert "name" in spot and spot["name"].strip()
        assert "state" in spot and spot["state"].strip()
        assert "category" in spot and spot["category"].strip()
        assert "image_url" in spot and spot["image_url"].startswith("http")




def test_itinerary_performance():
    start = time.perf_counter()
    
    res = client.post("/api/itinerary", json={"query": "California"})
    
    duration = time.perf_counter() - start
    print(f"⏱ Duration: {duration:.2f} seconds")

    assert res.status_code == 200
    assert "itinerary" in res.json()
    assert duration < 2.0  
