from __future__ import annotations

import math
from dataclasses import dataclass

from .models import LoadCase
from .sections import Section, sections_for

E_STEEL_MPA = 210_000.0
FY_MPA = 355.0
ALLOWABLE_BENDING_MPA = 0.66 * FY_MPA
ALLOWABLE_AXIAL_MPA = 0.60 * FY_MPA


@dataclass
class SizingResult:
    section: Section | None
    utilisation: float
    status: str  # "pass" | "review"


def _udl_kn_per_m(loads: LoadCase, tributary_width_m: float) -> float:
    return (loads.imposed_kn_m2 + loads.superimposed_kn_m2) * tributary_width_m


def design_flexural_member(span_m: float, tributary_width_m: float, loads: LoadCase) -> SizingResult:
    """Sizes a simply-supported UDL member (joist or primary beam) against a simplified
    allowable-stress bending check and a span/deflection-limit check, per PLAN.md's
    'simplified/conservative rule set' decision (Section 0)."""
    w_kn_per_m = _udl_kn_per_m(loads, tributary_width_m)
    span_mm = span_m * 1000

    moment_kn_m = w_kn_per_m * span_m**2 / 8
    moment_n_mm = moment_kn_m * 1e6
    zx_required_mm3 = moment_n_mm / ALLOWABLE_BENDING_MPA
    zx_required_cm3 = zx_required_mm3 / 1000

    deflection_limit_mm = span_mm / 360
    w_n_per_mm = w_kn_per_m  # 1 kN/m == 1 N/mm
    ix_required_mm4 = (5 * w_n_per_mm * span_mm**3 * 360) / (384 * E_STEEL_MPA)
    ix_required_cm4 = ix_required_mm4 / 1e4

    for section in sections_for("beam"):
        if section.Zx_cm3 is None or section.Ix_cm4 is None:
            continue
        if section.Zx_cm3 >= zx_required_cm3 and section.Ix_cm4 >= ix_required_cm4:
            bending_utilisation = zx_required_cm3 / section.Zx_cm3
            deflection_utilisation = ix_required_cm4 / section.Ix_cm4
            utilisation = round(max(bending_utilisation, deflection_utilisation), 2)
            status = "pass" if utilisation <= 0.85 else "review"
            return SizingResult(section=section, utilisation=utilisation, status=status)

    largest = sections_for("beam")[-1]
    return SizingResult(section=largest, utilisation=1.5, status="review")


def design_column(axial_load_kn: float, clear_height_m: float) -> SizingResult:
    """Simplified Euler-based buckling check about the minor axis, capped at yield —
    not a substitute for a full EC3 compression member check, but plausible for MVP sizing."""
    axial_load_n = axial_load_kn * 1000
    effective_length_mm = clear_height_m * 1000

    for section in sections_for("column"):
        if section.ry_mm is None:
            continue
        slenderness = effective_length_mm / section.ry_mm
        euler_stress_mpa = (math.pi**2 * E_STEEL_MPA) / (slenderness**2) if slenderness > 0 else FY_MPA
        allowable_stress_mpa = min(euler_stress_mpa, ALLOWABLE_AXIAL_MPA)
        area_mm2 = section.area_cm2 * 100
        actual_stress_mpa = axial_load_n / area_mm2
        utilisation = round(actual_stress_mpa / allowable_stress_mpa, 2)
        if utilisation <= 1.0:
            status = "pass" if utilisation <= 0.85 else "review"
            return SizingResult(section=section, utilisation=utilisation, status=status)

    largest = sections_for("column")[-1]
    return SizingResult(section=largest, utilisation=1.5, status="review")


def design_bracing(horizontal_load_kn: float) -> SizingResult:
    """Nominal-horizontal-load bracing check: a single tension diagonal per bay against
    an allowable-stress tension capacity. Ignores compression buckling of the angle —
    a documented simplification, not a real EC3 bracing design."""
    load_n = horizontal_load_kn * 1000
    for section in sections_for("angle"):
        area_mm2 = section.area_cm2 * 100
        capacity_n = area_mm2 * ALLOWABLE_AXIAL_MPA
        utilisation = round(load_n / capacity_n, 2)
        if utilisation <= 1.0:
            status = "pass" if utilisation <= 0.85 else "review"
            return SizingResult(section=section, utilisation=utilisation, status=status)

    largest = sections_for("angle")[-1]
    return SizingResult(section=largest, utilisation=1.5, status="review")
