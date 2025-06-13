#  WanderWise Test Plan

## all routes
- GET `/api/hello` – basic sanity check
- POST `/api/itinerary` – integration with OpenAI logic
- GET `/api/spots` – fetch from Supabase
- POST `/api/add-spot` – user input validation and duplication
- GET `/api/visited` – token validation
- Data Integrity – ensures spot fields exist
- Performance – ensures latency is acceptable

## 
- Unit Tests: Routes that return static or mock responses
- Integration Tests: FastAPI + OpenAI + Supabase + Firebase (coming soon)
- Data Validation Tests: Checking Supabase fields for correctness
- Performance Tests: Timing `/api/itinerary` latency

## Quality Metrics
- Tests written using `pytest`
- Coverage checked with `pytest-cov`
- Failures trigger CI alerts
- Inputs include valid, edge-case, and invalid scenarios
