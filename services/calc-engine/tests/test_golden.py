"""Golden test cases per PLAN.md Phase 0/1: the straightforward rectangular example from the
domain brief's Section 10, and a deliberately irregular case (L-shape, obstruction, and a
height-restricted zone) so the polygon/obstruction model is validated from day one."""

import time

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

RECTANGULAR_REQUEST = {
    "geometry": {
        "tiers": [
            {
                "boundary": [
                    {"x": 0, "y": 0},
                    {"x": 20, "y": 0},
                    {"x": 20, "y": 12},
                    {"x": 0, "y": 12},
                ],
                "obstructions": [],
                "constraint_zones": [],
                "clear_height_m": 4.5,
            }
        ]
    },
    "loads": {"imposed_kn_m2": 5.0, "superimposed_kn_m2": 0.5, "deflection_limit_denominator": 360},
    "structural_config": {},
}

IRREGULAR_REQUEST = {
    "geometry": {
        "tiers": [
            {
                "boundary": [
                    {"x": 0, "y": 0},
                    {"x": 20, "y": 0},
                    {"x": 20, "y": 9},
                    {"x": 12, "y": 9},
                    {"x": 12, "y": 14},
                    {"x": 0, "y": 14},
                ],
                "obstructions": [
                    {
                        "boundary": [
                            {"x": 9, "y": 3.5},
                            {"x": 10.5, "y": 3.5},
                            {"x": 10.5, "y": 5},
                            {"x": 9, "y": 5},
                        ],
                        "obstruction_type": "existing_column",
                    }
                ],
                "constraint_zones": [
                    {
                        "boundary": [
                            {"x": 14, "y": 0},
                            {"x": 20, "y": 0},
                            {"x": 20, "y": 4},
                            {"x": 14, "y": 4},
                        ],
                        "zone_type": "height_restricted",
                        "max_height_m": 3.0,
                    }
                ],
                "clear_height_m": 4.5,
            },
            {
                "boundary": [
                    {"x": 0, "y": 0},
                    {"x": 10, "y": 0},
                    {"x": 10, "y": 8},
                    {"x": 0, "y": 8},
                ],
                "obstructions": [],
                "constraint_zones": [],
                "clear_height_m": 4.0,
            },
        ]
    },
    "loads": {"imposed_kn_m2": 5.0, "superimposed_kn_m2": 0.5, "deflection_limit_denominator": 360},
    "structural_config": {},
}


def test_rectangular_golden_case_under_two_seconds():
    start = time.perf_counter()
    response = client.post("/design", json=RECTANGULAR_REQUEST)
    elapsed = time.perf_counter() - start

    assert response.status_code == 200
    result = response.json()
    assert elapsed < 2.0

    assert len(result["grids"]) == 1
    assert result["grids"][0]["columns"]
    assert result["members"]
    assert result["steel_weight_kg"] > 0
    assert result["deck_area_m2"] == 240.0
    assert result["checks_total"] > 0
    assert result["assumptions"]


def test_irregular_case_with_obstruction_and_height_zone_under_two_seconds():
    start = time.perf_counter()
    response = client.post("/design", json=IRREGULAR_REQUEST)
    elapsed = time.perf_counter() - start

    assert response.status_code == 200
    result = response.json()
    assert elapsed < 2.0

    # Two tiers, each with its own footprint, per the per-tier geometry override requirement.
    assert len(result["grids"]) == 2

    # The obstruction and/or height-restricted zone must surface as an explicit flag —
    # never silently auto-fixed (PLAN.md cross-cutting principle).
    assert result["warnings"], "expected at least one flag from the obstruction or height zone"

    assert result["members"]
    assert result["steel_weight_kg"] > 0


def test_dxf_export_returns_dxf_content():
    response = client.post("/design/dxf", json=RECTANGULAR_REQUEST)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/dxf"
    body = response.content.decode("utf-8")
    assert "SECTION" in body
    assert "ENTITIES" in body
