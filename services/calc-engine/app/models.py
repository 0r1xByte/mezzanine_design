from __future__ import annotations

from pydantic import BaseModel, Field


class Vertex(BaseModel):
    x: float
    y: float


class Obstruction(BaseModel):
    boundary: list[Vertex] = Field(min_length=3)
    obstruction_type: str = "existing_column"


class ConstraintZone(BaseModel):
    boundary: list[Vertex] = Field(min_length=3)
    zone_type: str  # "no_go" | "height_restricted" | "mandatory_clear"
    max_height_m: float | None = None


class TierGeometry(BaseModel):
    boundary: list[Vertex] = Field(min_length=3)
    obstructions: list[Obstruction] = []
    constraint_zones: list[ConstraintZone] = []
    clear_height_m: float = 4.5


class GeometryInput(BaseModel):
    tiers: list[TierGeometry] = Field(min_length=1)


class LoadCase(BaseModel):
    imposed_kn_m2: float = 5.0
    superimposed_kn_m2: float = 0.5
    deflection_limit_denominator: int = 360


class StructuralConfig(BaseModel):
    design_code: str = "EC3-simplified"
    section_library: str = "EN10365-sample"
    bracing_type: str = "perimeter"
    baseplate_mode: str = "default_bearing"
    assumed_bearing_kpa: float = 150.0


class DesignRequest(BaseModel):
    geometry: GeometryInput
    loads: LoadCase = LoadCase()
    structural_config: StructuralConfig = StructuralConfig()


class GridInfo(BaseModel):
    tier_index: int
    primary_spacings_m: list[float]
    secondary_spacing_m: float
    columns: list[Vertex]
    skipped_columns: list[Vertex] = []


class MemberScheduleRow(BaseModel):
    mark: str
    role: str  # joist | primary_beam | column | bracing
    tier_index: int
    section: str
    span_m: float | None
    utilisation: float
    status: str  # "pass" | "review"


class BOMLine(BaseModel):
    category: str
    description: str
    unit: str
    quantity: float
    wastage_factor: float = 1.0


class DesignResult(BaseModel):
    grids: list[GridInfo]
    members: list[MemberScheduleRow]
    bom: list[BOMLine]
    steel_weight_kg: float
    deck_area_m2: float
    checks_passed: int
    checks_total: int
    assumptions: list[str]
    warnings: list[str]
