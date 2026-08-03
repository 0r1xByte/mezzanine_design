from __future__ import annotations

from .models import BOMLine


def build_bom(total_steel_kg: float, deck_area_m2: float) -> list[BOMLine]:
    return [
        BOMLine(
            category="Structure",
            description="Structural steelwork — joists, beams, columns, bracing (S355)",
            unit="kg",
            quantity=round(total_steel_kg, 1),
            wastage_factor=1.05,
        ),
        BOMLine(
            category="Decking",
            description="6 mm chequer plate decking",
            unit="m2",
            quantity=round(deck_area_m2, 1),
            wastage_factor=1.05,
        ),
    ]
