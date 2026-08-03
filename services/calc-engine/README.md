# services/calc-engine

Python (FastAPI) calculation service: geometry validation, grid and member sizing, structural code
checks, bill-of-materials generation, and DXF drawing export (PLAN.md Phase 1).

Currently implemented: a health check endpoint, ahead of the geometry/design engine.

## Development

```
python -m venv .venv
.venv/Scripts/activate   # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Runs on `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.
