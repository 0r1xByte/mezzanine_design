from fastapi import FastAPI

app = FastAPI(title="Mezzanine Calc Engine")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
