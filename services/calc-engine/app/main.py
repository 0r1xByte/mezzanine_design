from fastapi import FastAPI
from fastapi.responses import Response

from .design import run_design
from .dxf_export import build_dxf
from .models import DesignRequest, DesignResult

app = FastAPI(title="Mezzanine Calc Engine")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/design", response_model=DesignResult)
def design(request: DesignRequest) -> DesignResult:
    return run_design(request)


@app.post("/design/dxf")
def design_dxf(request: DesignRequest) -> Response:
    result = run_design(request)
    dxf_bytes = build_dxf(request, result)
    return Response(
        content=dxf_bytes,
        media_type="application/dxf",
        headers={"Content-Disposition": "attachment; filename=floor-plan.dxf"},
    )
