# ==============================================================================
# Production Dockerfile for FoundryOS (Full-Stack Frontend + API behind Caddy)
# Supported Deploy Targets: Railway, Render, Fly.io, Self-Hosted VPS
# ==============================================================================

# --- Stage 1: Build Frontend SPA ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Build Backend & Prisma Client ---
FROM node:20-alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
COPY prisma ./prisma
COPY api ./api
COPY scripts ./scripts
RUN npm ci
RUN npx prisma generate --schema=./prisma/schema.prisma

# --- Stage 3: Production Full-Stack Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

# Install Caddy, OpenSSL, and process tools
RUN apk add --no-cache caddy openssl libc6-compat wget ca-certificates

ENV NODE_ENV=production
ENV DATA_DIR=/app/data

RUN mkdir -p /app/data /srv /etc/caddy

# Copy frontend static build to Caddy webroot
COPY --from=frontend-builder /app/dist /srv

# Copy backend application and dependencies
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/package.json ./package.json
COPY --from=backend-builder /app/api ./api
COPY --from=backend-builder /app/scripts ./scripts

# Copy Caddyfile and startup entrypoint
COPY Caddyfile /etc/caddy/Caddyfile
COPY scripts/start-production.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 80 443 8787

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8787/api/health || exit 1

CMD ["/app/start.sh"]
