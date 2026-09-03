# ==============================================================================
# Production Dockerfile for FoundryOS API Backend (Railway / Render / Docker Compose)
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma query engine
RUN apk add --no-cache openssl libc6-compat

# Copy root and api package manifests & prisma schema
COPY package*.json ./
COPY prisma ./prisma
COPY api ./api
COPY scripts ./scripts

# Install dependencies and generate Prisma client
RUN npm ci
RUN npx prisma generate --schema=./prisma/schema.prisma

FROM node:20-alpine AS runner
WORKDIR /app

# Install OpenSSL runtime dependency in runner
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=8787
ENV DATA_DIR=/app/data

RUN mkdir -p /app/data

# Copy built node_modules and code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/api ./api
COPY --from=builder /app/scripts ./scripts

EXPOSE 8787

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

CMD ["node", "api/server.js"]
