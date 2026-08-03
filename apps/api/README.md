# apps/api

Node.js (TypeScript, Fastify, Prisma) app layer: projects/enquiries, users/roles, price book CRUD,
quote template rendering, revision history, document assembly, and the change-impact dependency
graph.

## Development

Requires Postgres running (see `infra/docker-compose.yml`, or point `DATABASE_URL` at your own) and
`services/calc-engine` running on `CALC_ENGINE_URL` for the design-revision endpoints.

```
cp .env.example .env   # adjust DATABASE_URL / CALC_ENGINE_URL if needed
npm install
npx prisma migrate dev
npm run seed            # populates the price book with starter rates
npm run dev
```

Runs on `http://localhost:3001`.

## Data model

`DesignRevision` stores one immutable snapshot per computed state (full input + full `DesignResult`
output as JSON) rather than versioning geometry/loads/design-result as separate chains — see
PLAN.md Section 4's revision-model note. `Quote` references a `DesignRevision`.

## Routes

- `GET /health`
- `GET /projects`
- `GET /projects/:id`
- `POST /projects`
- `POST /projects/:id/design-revisions` — calls `services/calc-engine` `/design` and persists the
  result as a new `DesignRevision`.
- `GET /projects/:id/design-revisions`
- `GET /projects/:id/design-revisions/latest`
- `GET /projects/:id/design-revisions/compare?from=1&to=2` — change-impact report between any two
  revisions (changed input sections, resized/added/removed members, steel weight and checks
  deltas, new/resolved flags).
- `GET /projects/:id/design-revisions/:revisionNumber` — a single revision.
- `GET /projects/:id/design-revisions/:revisionNumber/impact` — shorthand for comparing a revision
  against the one immediately before it.
- `GET /price-book?region=default`
- `POST /price-book`
- `PUT /price-book/:id`
- `DELETE /price-book/:id`
- `POST /projects/:id/design-revisions/:revisionNumber/quote` — assembles line items from the
  revision's BOM matched against the price book (by category + unit), plus any
  `ancillarySelections` (stairs, gates, etc. — each priced independently of the BOM). Re-posting to
  the same revision updates the existing quote rather than creating a new one.
- `GET /projects/:id/design-revisions/:revisionNumber/quote`
- `GET /quotes/:id`

Quote totals (subtotal after markup, contingency, installation, grand total) are computed on read
from `lineItems` + `markupPercent`/`contingencyPercent`/`installationTotal`, not stored, so editing
any of those inputs keeps the numbers consistent without a re-save step.

- `GET /projects/:id/design-revisions/:revisionNumber/drawing.dxf` — proxies to
  `services/calc-engine`'s `/design/dxf` using the revision's stored input, so drawings stay in sync
  with the exact design that was run (Python owns DXF generation end to end — see the architecture
  note in memory; apps/api never re-implements drawing geometry).
- `GET /projects/:id/design-revisions/:revisionNumber/material-takeoff.csv` — the revision's BOM as
  a CSV.
- `GET /projects/:id/design-revisions/:revisionNumber/quote/pdf` — a quotation PDF (line items by
  category, totals, assumptions/exclusions) rendered with `pdfkit` from the persisted `Quote`.
