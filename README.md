# Pixel Perfect Screenshot

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pixel-perfect-snapshot-1780.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/796465d7-dee6-45da-95cf-5d8505b87483).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

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

### Production

```sh
docker compose up --build      # http://localhost:3000
```

- The build inlines the public `VITE_*` values from `.env` into the client bundle.
- Server-side vars (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, …) are injected at runtime via `env_file`.
- See `.env.example` for the full list of supported variables.

### Development (hot reload)

```sh
docker compose --profile dev up   # http://localhost:8080
```

Source is bind-mounted; dependencies live in a named volume so the host
`node_modules` is left untouched.

### Build the image directly

```sh
docker build -t pixel-perfect-snapshot:latest .
docker run --rm -p 3000:3000 --env-file .env pixel-perfect-snapshot:latest
```
