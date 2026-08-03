from __future__ import annotations

import io

import ezdxf

from .models import DesignRequest, DesignResult

COLUMN_RADIUS_M = 0.15


def build_dxf(request: DesignRequest, result: DesignResult) -> bytes:
    doc = ezdxf.new("R2010")
    doc.layers.add(name="BOUNDARY", color=5)
    doc.layers.add(name="OBSTRUCTION", color=30)
    doc.layers.add(name="GRID", color=8)
    doc.layers.add(name="COLUMNS", color=5)
    msp = doc.modelspace()

    for tier_index, tier in enumerate(request.geometry.tiers):
        boundary_pts = [(v.x, v.y) for v in tier.boundary]
        msp.add_lwpolyline(boundary_pts, close=True, dxfattribs={"layer": "BOUNDARY"})

        for obstruction in tier.obstructions:
            pts = [(v.x, v.y) for v in obstruction.boundary]
            msp.add_lwpolyline(pts, close=True, dxfattribs={"layer": "OBSTRUCTION"})

        grid = result.grids[tier_index]
        for column in grid.columns:
            msp.add_circle((column.x, column.y), COLUMN_RADIUS_M, dxfattribs={"layer": "COLUMNS"})
        for column in grid.skipped_columns:
            msp.add_circle((column.x, column.y), COLUMN_RADIUS_M, dxfattribs={"layer": "GRID"})

        if boundary_pts:
            label_x = min(p[0] for p in boundary_pts)
            label_y = max(p[1] for p in boundary_pts) + 0.5
            msp.add_text(
                f"Tier {tier_index + 1} — plan",
                dxfattribs={"layer": "GRID", "height": 0.3, "insert": (label_x, label_y)},
            )

    buffer = io.StringIO()
    doc.write(buffer)
    return buffer.getvalue().encode("utf-8")
