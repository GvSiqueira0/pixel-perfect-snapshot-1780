# syntax=docker/dockerfile:1

# ---------- Build stage ----------
# Bun is used to honor the committed bun.lock exactly.
FROM docker.io/oven/bun:1 AS build
WORKDIR /app

# Install dependencies first so this layer is cached when only source changes.
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# Copy the rest of the project. Vite reads .env at build time and inlines the
# public VITE_* values into the client bundle.
COPY . .
RUN bun run build

# ---------- Runtime stage ----------
# The nitro "node-server" output is a self-contained Node server.
FROM docker.io/library/node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
