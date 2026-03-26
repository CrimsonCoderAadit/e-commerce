# ── Stage 1: production deps ──────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── Stage 2: all deps (used by docker-compose.override.yml for local dev) ─
FROM node:20-alpine AS devdeps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# ── Stage 3: production runner ────────────────────────────────────────────
# No HTTP server — background worker only, no EXPOSE or HEALTHCHECK
FROM node:20-alpine AS runner
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./
ENV NODE_ENV=production
USER app
CMD ["node", "src/index.js"]
