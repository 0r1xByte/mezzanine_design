# apps/api

Node.js (TypeScript, Fastify) app layer: projects/enquiries, users/roles, price book CRUD, quote
template rendering, revision history, document assembly, and the change-impact dependency graph.

Currently implemented: health check and an in-memory projects CRUD stub, ahead of Postgres/Prisma
being wired up (PLAN.md Phase 2).

## Development

```
npm install
npm run dev
```

Runs on `http://localhost:3001`.

## Routes

- `GET /health`
- `GET /projects`
- `GET /projects/:id`
- `POST /projects`
