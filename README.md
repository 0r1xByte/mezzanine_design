# Mezzanine Design & Quoting Software

Designs single and multi-tier mezzanine floors, runs the structural calculations, generates
material quantities and quotations, and exports the floor model to CAD.

See [PLAN.md](PLAN.md) for the full build plan and architecture, and
[docs/](docs/) for the domain requirements and API contracts as they're written.

## Repository layout

```
apps/
  web/                 # React + TS single-page app
  api/                 # Node.js (TypeScript) app layer
services/
  calc-engine/         # Python (FastAPI) design/BOM/code-check service
packages/
  shared-types/        # Shared schema contracts (OpenAPI-generated TS + Python types)
docs/                  # Domain requirements, API contracts
infra/                 # docker-compose for local development
```

## Status

Early scaffolding. See PLAN.md Section 6 for the current build sequence.
