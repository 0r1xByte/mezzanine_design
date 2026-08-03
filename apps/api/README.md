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
- `GET /projects/:id/design-revisions/:revisionNumber`
