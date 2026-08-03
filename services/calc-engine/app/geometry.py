from __future__ import annotations

import math

from shapely.geometry import Point, Polygon

from .models import ConstraintZone, GridInfo, Obstruction, TierGeometry, Vertex

PRIMARY_SPACING_BAND = (4.5, 7.5)
PRIMARY_SPACING_TARGET = 6.0
SECONDARY_SPACING_BAND = (3.0, 4.5)
SECONDARY_SPACING_TARGET = 4.0
OBSTRUCTION_CLEARANCE_M = 0.3
NUDGE_STEP_M = 0.6


def _polygon(vertices: list[Vertex]) -> Polygon:
    return Polygon([(v.x, v.y) for v in vertices])


def _choose_spacing(extent: float, target: float, band: tuple[float, float]) -> tuple[float, int]:
    """Pick a bay count/spacing pair so spacing lands as close to target as possible
    while staying inside the economical span band, per PLAN.md's rule-based grid heuristic."""
    if extent <= band[1]:
        return extent, 1
    best = None
    n_guess = max(1, round(extent / target))
    for n in range(max(1, n_guess - 2), n_guess + 3):
        spacing = extent / n
        in_band = band[0] <= spacing <= band[1]
        score = -abs(spacing - target) - (0 if in_band else 1000)
        if best is None or score > best[0]:
            best = (score, spacing, n)
    _, spacing, n = best
    return spacing, n


def _avoid_zones(point: Point, avoid_polys: list[Polygon]) -> bool:
    return any(poly.contains(point) or poly.touches(point) for poly in avoid_polys)


def generate_grid(tier_index: int, tier: TierGeometry) -> tuple[GridInfo, list[str]]:
    warnings: list[str] = []
    boundary = _polygon(tier.boundary)
    minx, miny, maxx, maxy = boundary.bounds
    width = maxx - minx
    depth = maxy - miny

    primary_spacing, n_primary = _choose_spacing(width, PRIMARY_SPACING_TARGET, PRIMARY_SPACING_BAND)
    secondary_spacing, n_secondary = _choose_spacing(depth, SECONDARY_SPACING_TARGET, SECONDARY_SPACING_BAND)

    avoid_polys = [
        _polygon(o.boundary).buffer(OBSTRUCTION_CLEARANCE_M) for o in tier.obstructions
    ] + [
        _polygon(z.boundary) for z in tier.constraint_zones if z.zone_type == "no_go"
    ]

    height_zones = [z for z in tier.constraint_zones if z.zone_type == "height_restricted"]
    for zone in height_zones:
        zone_poly = _polygon(zone.boundary)
        if boundary.intersects(zone_poly):
            warnings.append(
                f"Height-restricted zone (max {zone.max_height_m} m) overlaps the floor plate — "
                "members in this area need manual clearance review."
            )

    placed: list[Vertex] = []
    skipped: list[Vertex] = []

    xs = [minx + i * primary_spacing for i in range(n_primary + 1)]
    ys = [miny + j * secondary_spacing for j in range(n_secondary + 1)]

    nudge_offsets = [
        (NUDGE_STEP_M, 0), (-NUDGE_STEP_M, 0), (0, NUDGE_STEP_M), (0, -NUDGE_STEP_M),
    ]

    for x in xs:
        for y in ys:
            point = Point(x, y)
            if not (boundary.contains(point) or boundary.touches(point)):
                continue  # grid intersection falls outside an irregular (e.g. L-shaped) boundary

            if not _avoid_zones(point, avoid_polys):
                placed.append(Vertex(x=x, y=y))
                continue

            nudged = None
            for dx, dy in nudge_offsets:
                candidate = Point(x + dx, y + dy)
                if (boundary.contains(candidate) or boundary.touches(candidate)) and not _avoid_zones(
                    candidate, avoid_polys
                ):
                    nudged = candidate
                    break

            if nudged is not None:
                distance = math.hypot(nudged.x - x, nudged.y - y)
                placed.append(Vertex(x=nudged.x, y=nudged.y))
                warnings.append(
                    f"Column at ({x:.1f}, {y:.1f}) shifted {distance:.1f} m to clear an "
                    "obstruction — adjacent bay re-spanned."
                )
            else:
                skipped.append(Vertex(x=x, y=y))
                warnings.append(
                    f"Column at ({x:.1f}, {y:.1f}) omitted — no valid position clears the "
                    "obstruction; adjacent bay re-spans across the gap."
                )

    grid = GridInfo(
        tier_index=tier_index,
        primary_spacings_m=[round(primary_spacing, 2)] * n_primary,
        secondary_spacing_m=round(secondary_spacing, 2),
        columns=placed,
        skipped_columns=skipped,
    )
    return grid, warnings


def gross_area_m2(tier: TierGeometry) -> float:
    boundary = _polygon(tier.boundary)
    obstruction_area = sum(_polygon(o.boundary).area for o in tier.obstructions)
    return max(boundary.area - obstruction_area, 0.0)


def perimeter_m(tier: TierGeometry) -> float:
    return _polygon(tier.boundary).length
