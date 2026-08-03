from __future__ import annotations

import math

from .bom import build_bom
from .geometry import generate_grid, gross_area_m2, perimeter_m
from .models import DesignRequest, DesignResult, MemberScheduleRow
from .sizing import design_bracing, design_column, design_flexural_member

NOTIONAL_HORIZONTAL_LOAD_FRACTION = 0.025


def run_design(request: DesignRequest) -> DesignResult:
    members: list[MemberScheduleRow] = []
    grids = []
    warnings: list[str] = []
    assumptions: list[str] = []
    checks_passed = 0
    checks_total = 0
    total_steel_kg = 0.0
    total_deck_area_m2 = 0.0

    for tier_index, tier in enumerate(request.geometry.tiers):
        grid, grid_warnings = generate_grid(tier_index, tier)
        warnings.extend(grid_warnings)
        grids.append(grid)

        gross_area = gross_area_m2(tier)
        total_deck_area_m2 += gross_area

        avg_primary = (
            sum(grid.primary_spacings_m) / len(grid.primary_spacings_m)
            if grid.primary_spacings_m
            else grid.secondary_spacing_m
        )
        secondary = grid.secondary_spacing_m
        tier_label = f"T{tier_index + 1}"

        # Joists: span the secondary bay, tributary width equal to their own spacing.
        joist = design_flexural_member(span_m=secondary, tributary_width_m=secondary, loads=request.loads)
        checks_total += 1
        checks_passed += 1 if joist.status == "pass" else 0
        joist_total_length_m = gross_area / secondary if secondary else 0
        total_steel_kg += joist.section.mass_kg_per_m * joist_total_length_m
        members.append(
            MemberScheduleRow(
                mark=f"J-{tier_label}",
                role="joist",
                tier_index=tier_index,
                section=joist.section.name,
                span_m=round(secondary, 2),
                utilisation=joist.utilisation,
                status=joist.status,
            )
        )

        # Primary beams: span between columns, picking up a joist-bay tributary width.
        beam = design_flexural_member(span_m=avg_primary, tributary_width_m=secondary, loads=request.loads)
        checks_total += 1
        checks_passed += 1 if beam.status == "pass" else 0
        beam_total_length_m = gross_area / avg_primary if avg_primary else 0
        total_steel_kg += beam.section.mass_kg_per_m * beam_total_length_m
        members.append(
            MemberScheduleRow(
                mark=f"B-{tier_label}",
                role="primary_beam",
                tier_index=tier_index,
                section=beam.section.name,
                span_m=round(avg_primary, 2),
                utilisation=beam.utilisation,
                status=beam.status,
            )
        )

        # A skipped column doubles the local span across the gap — sized and flagged separately.
        if grid.skipped_columns:
            merged_span = avg_primary * 2
            merged = design_flexural_member(span_m=merged_span, tributary_width_m=secondary, loads=request.loads)
            checks_total += 1
            checks_passed += 1 if merged.status == "pass" else 0
            total_steel_kg += merged.section.mass_kg_per_m * merged_span
            members.append(
                MemberScheduleRow(
                    mark=f"B-{tier_label}-RS",
                    role="primary_beam",
                    tier_index=tier_index,
                    section=merged.section.name,
                    span_m=round(merged_span, 2),
                    utilisation=merged.utilisation,
                    status=merged.status,
                )
            )
            assumptions.append(
                f"{tier_label}: re-spanned beam across an omitted column carries a "
                f"{merged_span:.1f} m span — verify against the actual obstruction footprint."
            )

        # Columns: tributary-area axial load, simplified minor-axis buckling check.
        tributary_area_m2 = avg_primary * secondary
        axial_load_kn = (request.loads.imposed_kn_m2 + request.loads.superimposed_kn_m2) * tributary_area_m2
        column = design_column(axial_load_kn, tier.clear_height_m)
        checks_total += 1
        checks_passed += 1 if column.status == "pass" else 0
        n_columns = max(len(grid.columns), 1)
        total_steel_kg += column.section.mass_kg_per_m * tier.clear_height_m * n_columns
        members.append(
            MemberScheduleRow(
                mark=f"C-{tier_label}",
                role="column",
                tier_index=tier_index,
                section=column.section.name,
                span_m=round(tier.clear_height_m, 2),
                utilisation=column.utilisation,
                status=column.status,
            )
        )

        # Bracing: one perimeter bay per ~24 m run, nominal horizontal load fraction.
        perimeter = perimeter_m(tier)
        n_bracing_bays = max(1, round(perimeter / 24))
        total_vertical_load_kn = (request.loads.imposed_kn_m2 + request.loads.superimposed_kn_m2) * gross_area
        horizontal_load_per_bay_kn = (
            NOTIONAL_HORIZONTAL_LOAD_FRACTION * total_vertical_load_kn / n_bracing_bays
        )
        bracing = design_bracing(horizontal_load_per_bay_kn)
        checks_total += 1
        checks_passed += 1 if bracing.status == "pass" else 0
        diagonal_length_m = math.hypot(avg_primary, secondary)
        total_steel_kg += bracing.section.mass_kg_per_m * diagonal_length_m * n_bracing_bays
        members.append(
            MemberScheduleRow(
                mark=f"BR-{tier_label}",
                role="bracing",
                tier_index=tier_index,
                section=bracing.section.name,
                span_m=None,
                utilisation=bracing.utilisation,
                status=bracing.status,
            )
        )

    assumptions.append(
        f"Baseplates sized for an assumed bearing pressure of "
        f"{request.structural_config.assumed_bearing_kpa:.0f} kPa — confirm against a site survey."
    )
    assumptions.append(
        f"Design code: {request.structural_config.design_code} — simplified allowable-stress "
        "checks for quoting-stage sizing, not a substitute for a certified design."
    )

    bom = build_bom(total_steel_kg, total_deck_area_m2)

    return DesignResult(
        grids=grids,
        members=members,
        bom=bom,
        steel_weight_kg=round(total_steel_kg, 1),
        deck_area_m2=round(total_deck_area_m2, 1),
        checks_passed=checks_passed,
        checks_total=checks_total,
        assumptions=assumptions,
        warnings=warnings,
    )
