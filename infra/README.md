# infra

`docker-compose.yml` wires up Postgres, apps/api, services/calc-engine, and apps/web for local
development, each with a hot-reload dev Dockerfile in its own directory.

## Usage

```
docker compose -f infra/docker-compose.yml up
```

- web: http://localhost:5173
- api: http://localhost:3001
- calc-engine: http://localhost:8000 (docs at /docs)
- postgres: localhost:5432 (user/password/db: mezzanine)

apps/api does not yet use `DATABASE_URL` or `CALC_ENGINE_URL` — they're wired into the compose file
ahead of Phase 2 (Postgres persistence, Node→Python calls) landing in code.
