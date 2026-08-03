from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "sections.json"


@dataclass
class Section:
    name: str
    mass_kg_per_m: float
    area_cm2: float
    depth_mm: float | None = None
    Ix_cm4: float | None = None
    Zx_cm3: float | None = None
    ry_mm: float | None = None


def _load() -> dict[str, list[Section]]:
    raw = json.loads(DATA_PATH.read_text())
    library: dict[str, list[Section]] = {}
    for role, entries in raw.items():
        sections = [Section(**entry) for entry in entries]
        sections.sort(key=lambda s: s.mass_kg_per_m)
        library[role] = sections
    return library


LIBRARY = _load()


def sections_for(role: str) -> list[Section]:
    return LIBRARY[role]
