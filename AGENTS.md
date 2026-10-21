# AGENTS.md

## Project

Self-hosted TanStack Start app (SSR) with Supabase. Built with bun inside Docker.
This project is **no longer connected to Lovable** — the history was rewritten to
remove a previously committed `.env`, so treat git history as freely editable.

## Conventions

- **Package manager: bun.** Never add `package-lock.json`/`yarn.lock`/`pnpm-lock.yaml`; keep `bun.lock` in sync (`bun install`).
- **Secrets:** never commit `.env` (it holds Supabase keys and the DB password). Use `.env.example` as the template. It is git-ignored on purpose.
- **Public build-time values:** the `VITE_*` vars are inlined into the client bundle at build time (passed as Docker build args). They must be present when the image builds.
- **Ports:** `:3000` production (Docker `web`), `:8080` local `bun run dev`, `:8081` Docker dev profile.

## Commands

```sh
docker compose up -d web             # production, http://localhost:3000
docker compose --profile dev up      # hot reload, http://localhost:8081
./scripts/check-ports.sh             # verify required ports are free
./scripts/verify-auth.sh http://localhost:3000   # read-only auth wiring checks
```
