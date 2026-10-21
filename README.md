# Pixel Perfect Screenshot

Implement exactly the screenshot and nothing else

Self-hosted TanStack Start (SSR) app with Supabase, built with bun inside Docker.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Run with Docker

The image builds the app for a self-hosted Node server (Nitro `node-server`
preset) and serves it from a minimal runtime. Configuration is read from `.env`.

Prerequisites: Docker with the Compose plugin.

> **You must provide your own `.env`.** It is **not** committed (it holds your
> Supabase keys and a database password). A plain `docker compose up` on a fresh
> clone will **not** work until `.env` exists and is filled in.

### Quickstart (clone → up)

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is enough).
2. **Copy the example and fill it in** — `cp .env.example .env`, then set:
   - Dashboard → **Project Settings → API**: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID` (and the matching `VITE_*` copies).
   - Dashboard → **Project Settings → Database → Connection string**: copy the
     **Session pooler** (IPv4) URI into `SUPABASE_DB_URL`. Do **not** use the direct
     host `db.<ref>.supabase.co` — it is IPv6-only and unreachable from Docker.
3. **Allow the local URL** — Dashboard → **Authentication → URL Configuration**: add
   Redirect URLs `http://localhost:3000` (and `http://localhost:8081` if you also
   use the Docker dev profile below).
4. **Start everything**:

   ```sh
   docker compose up -d web       # http://localhost:3000
   ```

   Run it **from the repository root**, so Compose reads the `.env` there (it
   supplies both the build-time `VITE_*` values and the runtime `SUPABASE_*` ones).

   > Always pass `-d` (detached). Without it, `docker compose up` stays attached
   > to your terminal: closing the terminal (or `Ctrl+C`) **stops the container**,
   > and the page then fails to load. There is no technical requirement for `-d`
   > — it just keeps the app running independently of the terminal. To stop on
   > purpose, use `docker compose down`.

   The `migrate` service applies `drizzle/migrations/*.sql` (the `profiles`
   table, RLS and the signup trigger) before the app starts. If `SUPABASE_DB_URL`
   is empty, migrations are skipped with a warning.

   Or use the helper: `./scripts/bootstrap.sh` (copies `.env`, validates it, then starts).

**Sign-in options out of the box:** email + password. **Google** requires your
own OAuth credentials (Supabase → Authentication → Providers → Google) — they are
per-project secrets and cannot be shipped in the repo.

### Ports

| Port | What | How it starts |
| --- | --- | --- |
| `3000` | Production app (Docker `web`) | `docker compose up -d web` |
| `8080` | Dev server on the host (`bun run dev`) | `npm run dev` / `bun run dev` |
| `8081` | Dev server inside Docker | `docker compose --profile dev up` |

The Docker dev profile uses `:8081` on purpose so it never collides with a local
`bun run dev` running on Vite's default `:8080`. The two can run **at the same
time** (`:8080` = host dev, `:8081` = Docker dev) alongside the production app on
`:3000`.

Before starting, you can confirm nothing is squatting on the required ports:

```sh
./scripts/check-ports.sh        # :3000 and :8081 must be free (or a compose container)
```

### Production

```sh
docker compose up -d web       # http://localhost:3000
```

- The `web` service uses `pull_policy: build`, so `docker compose up` always
  rebuilds the image and runs the latest code/`.env` — no stale image.
- The build inlines the public `VITE_*` values from `.env` into the client bundle.
- Server-side vars (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, …) are injected at runtime via `env_file`.
- The `migrate` service runs the SQL migrations against `SUPABASE_DB_URL` first.
- See `.env.example` for the full list of supported variables.

> Dependencies are installed inside the image with `bun install --frozen-lockfile`.
> After changing `package.json`, regenerate the lockfile so the build stays in sync:
>
> ```sh
> docker run --rm -v "$PWD:/app" -w /app docker.io/oven/bun:1 bun install
> ```

### Development (hot reload)

```sh
docker compose --profile dev up   # http://localhost:8081
```

Source is bind-mounted; dependencies live in a named volume so the host
`node_modules` is left untouched. Uses `:8081` to avoid clashing with a local
`bun run dev` on `:8080`.

### Build the image directly

```sh
docker build -t pixel-perfect-snapshot:latest .
docker run --rm -p 3000:3000 --env-file .env pixel-perfect-snapshot:latest
```

## Verify auth wiring

Read-only checks that the app is pointed at the right Supabase project and that
the Google flow is wired (no browser needed):

```sh
./scripts/verify-auth.sh http://localhost:3000
```

Optional headless check that clicks the Google button and asserts the OAuth
redirect target (requires the `playwright` package with `chromium` installed):

```sh
node scripts/verify-google-click.cjs http://localhost:3000
```
