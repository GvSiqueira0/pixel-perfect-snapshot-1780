# syntax=docker/dockerfile:1

# ---------- Build stage ----------
# Bun is used to honor the committed bun.lock exactly.
FROM docker.io/oven/bun:1 AS build
WORKDIR /app

# Install dependencies first so this layer is cached when only source changes.
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# Copy the rest of the project.
COPY . .

# Public build-time values. Vite inlines these into the client bundle, so they
# must be present when `bun run build` runs. Supplied as build args so the rest
# of .env (e.g. DB password) never enters the image.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

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
