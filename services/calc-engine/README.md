# services/calc-engine

Python (FastAPI) calculation service: geometry validation, grid and member sizing, structural code
checks, bill-of-materials generation, and DXF drawing export (PLAN.md Phase 1).

Sizing uses a simplified, rule-based allowable-stress design method (bending, deflection, and a
minor-axis buckling check for columns) against a small sample section library — plausible for
quoting-stage sizing per PLAN.md Section 0's decision, not a certified structural design.

## Development

```
python -m venv .venv
.venv/Scripts/activate   # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Runs on `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## Tests

```
pytest
```

Includes the two Phase 0 golden cases: the straightforward rectangular example from the domain
brief, and a deliberately irregular case (L-shaped boundary, an obstruction, and a height-restricted
zone) to validate the polygon/obstruction model from day one.

## Endpoints

- `GET /health`
- `POST /design` — geometry + loads + structural config in, `DesignResult` (grid, member schedule,
  BOM, assumptions, warnings) out.
- `POST /design/dxf` — same input, returns a DXF file of the floor plan (boundary, obstructions,
  column grid) per tier.

## Structure

```
app/
  models.py        # request/response schema (geometry, loads, design result, BOM)
  sections.py       # section library loader (data/sections.json)
  geometry.py        # polygon boundary, grid generation, obstruction avoidance
  sizing.py         # member sizing (flexural, column, bracing checks)
  bom.py            # BOM line assembly
  design.py         # orchestrates geometry -> sizing -> BOM into a DesignResult
  dxf_export.py     # DesignResult -> DXF file bytes
  main.py           # FastAPI app and routes
data/sections.json  # sample UB/UC/EA section properties
tests/test_golden.py
```
