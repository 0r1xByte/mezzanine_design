# Mezzanine Design & Quoting Software

Designs single and multi-tier mezzanine floors, runs the structural calculations, generates
material quantities and quotations, and exports the floor model to CAD.

## What it looks like

An enquiry produces a real structural design and BOM in seconds — steel sections sized against a
rule-based simplified code check, a column grid, and a priced quote with PDF/DXF/CSV exports.

| Enquiry | Geometry & grid |
|---|---|
| ![Enquiry form](docs/screenshots/01-enquiry.png) | ![Geometry screen](docs/screenshots/03-geometry.png) |

| Design & BOM | Quote |
|---|---|
| ![Design and BOM screen](docs/screenshots/02-design-bom.png) | ![Quote screen](docs/screenshots/04-quote.png) |

The Quote screen's "Download sales drawing (DXF)" button pulls the plan view straight from
`services/calc-engine` — boundary, column grid, and (when present) obstructions:

![Sales drawing example, rendered from the DXF export](docs/screenshots/05-drawing.png)

A static preview of the frontend (no backend behind it) is deployed to
[0r1xbyte.github.io/mezzanine_design](https://0r1xbyte.github.io/mezzanine_design/) — see
[apps/web's README](apps/web/README.md) for what that preview can and can't do, and how to run the
full stack locally to actually use it.

## Repository layout

```
apps/
  web/                 # React + TS single-page app
  api/                 # Node.js (TypeScript, Fastify, Prisma) app layer
services/
  calc-engine/         # Python (FastAPI) geometry/design/BOM/DXF service
packages/
  shared-types/        # Shared OpenAPI schema stub (not yet code-generated into either app)
docs/                  # Screenshots, domain requirements, API contracts
infra/                 # docker-compose for local development (Postgres + all three services)
```

## Status

The MVP described in PLAN.md Phases 1-4 is implemented end to end for the rectangular
single-tier case: enquiry intake, geometry/grid generation with obstruction avoidance, simplified
structural sizing, BOM, pricing, quote generation, and PDF/DXF/CSV exports. See each app's README
for specifics — in particular [apps/web's README](apps/web/README.md), which is explicit about
what's wired to live data versus still a placeholder (Loads/Pricing/Drawings screens, the
polygon/obstruction drawing canvas). PLAN.md Phase 5 (pilot validation) hasn't started.

## Running it locally

```
docker compose -f infra/docker-compose.yml up -d postgres

cd services/calc-engine && python -m venv .venv && .venv/Scripts/activate
pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

cd apps/api && cp .env.example .env && npm install
npx prisma migrate dev && npm run seed && npm run dev

cd apps/web && cp .env.example .env && npm install && npm run dev
```

Then open `http://localhost:5173`.
