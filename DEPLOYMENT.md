# Production Deployment & Infrastructure Runbook

This runbook outlines the production deployment workflow, environment configuration, containerization, and continuous integration / continuous deployment (CI/CD) pipelines for the **Brand-First CMS Platform**.

---

## 1. Environment & Prerequisites

- **Node.js**: >= v20.0.0
- **TypeScript**: Strict mode (`npm run typecheck`)
- **Containerization Engine**: Docker / Podman
- **Web Server**: Nginx (Alpine) with SPA fallback routing and gzip compression

---

## 2. Automated Quality Gates

Before any production deployment or release image is created, all quality gates must pass with 0 failures:

```bash
# 1. Typecheck Validation
npm run typecheck

# 2. Automated Test Suite (All 73 Hardening & E2E Tests)
npm test

# 3. Production Static Build
npm run build
```

---

## 3. Production Deployment Options

### Option A: Docker Container Deployment (Recommended)

1. **Build & Run with Docker Compose**:
   ```bash
   docker compose up --build -d
   ```
   The application will be live at `http://localhost:8080` with built-in health checks at `http://localhost:8080/health`.

2. **Standalone Docker Build**:
   ```bash
   # Build the production image
   docker build -t brand-first-app:latest .

   # Run container
   docker run -d --name brand-first-production -p 80:80 brand-first-app:latest
   ```

### Option B: Cloud Static Hosting (Vercel / Netlify / Cloudflare Pages / Firebase)

1. **Build the production bundle**:
   ```bash
   npm run build
   ```
2. **Publish Directory**: `dist`
3. **SPA Rewrite Rule**: Redirect all routes (`/*`) to `/index.html` with status `200`.

### Option C: AWS S3 + CloudFront CDN

1. Sync the `dist/` folder to your target S3 bucket:
   ```bash
   aws s3 sync dist/ s3://your-production-bucket --delete
   ```
2. Invalidate the CloudFront distribution cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

---

## 4. Security & Production Best Practices

- **Security Headers**: Standard Nginx configuration enforces `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and restrictive `Content-Security-Policy`.
- **Immutable Cache**: Static chunk assets in `/assets/*` are configured with 1-year immutable caching (`Cache-Control: public, immutable`).
- **Health Checks**: Automated HTTP endpoint at `/health` returning `200 OK` for load balancer probes.
