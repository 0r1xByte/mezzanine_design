# packages/shared-types

`openapi.yaml` is the single source of truth for entities shared between apps/api (TypeScript) and
services/calc-engine (Python), so the two never drift (PLAN.md Phase 0).

Currently defines: `Project`. Geometry, LoadCase, DesignResult, BOMLine, PriceBookEntry, Quote, and
DesignRevision (PLAN.md Section 4) will be added here before Phase 1 implementation starts, then
generated into TypeScript types and Pydantic models rather than hand-written in each app.

## Planned generation (not yet wired up)

```
npx openapi-typescript openapi.yaml -o ../../apps/api/src/generated/types.ts
datamodel-codegen --input openapi.yaml --output ../../services/calc-engine/app/generated/models.py
```
