# 🚀 FoundryOS Production Deployment Guide (Railway & Postgres)

This guide walks you through deploying FoundryOS to production at **https://tacfos.tech** on **Railway** with a managed **PostgreSQL** database.

---

## 📋 Prerequisites Checklist

Before starting, gather the following production configuration keys:
- **GitHub Repository Access:** `https://github.com/FinesseJones/FoundryOS`
- **Domain DNS Control:** `tacfos.tech` (Cloudflare / Namecheap / GoDaddy)
- **Stripe Live/Test Keys:**
  - `STRIPE_SECRET_KEY` (`sk_...`)
  - `STRIPE_WEBHOOK_SECRET` (`whsec_...`)
  - `STRIPE_PRICE_STARTER` (`price_...`)
  - `STRIPE_PRICE_GROWTH` (`price_...`)
  - `STRIPE_PRICE_ENTERPRISE` (`price_...`)
- **NVIDIA NIM Key:** `NVIDIA_API_KEY` (`nvapi-...`)
- **Master Admin Secret:** Generate via terminal:
  ```bash
  openssl rand -hex 32
  ```

---

## 🛠️ Step-by-Step Deployment Protocol

### Step 1: Create the Railway Project & Connect Repository

1. Log into [Railway.app](https://railway.app).
2. Click **+ New Project** $\rightarrow$ Select **Deploy from GitHub repo**.
3. Choose the repository: **`FinesseJones/FoundryOS`**.
4. Railway will automatically detect the root `Dockerfile` and configure deployment.

---

### Step 2: Provision Managed PostgreSQL Database

1. In your Railway project canvas, click **+ Create** $\rightarrow$ **Database** $\rightarrow$ **PostgreSQL**.
2. Railway instantly provisions your managed PostgreSQL cluster and automatically creates the `DATABASE_URL` connection string variable.

---

### Step 3: Configure Environment Variables

1. Click on the **FoundryOS** application service in Railway $\rightarrow$ Navigate to the **Variables** tab.
2. Click **+ New Variable** (or **Raw Editor**) and input the following required production variables:

```env
NODE_ENV=production
PORT=80
DOMAIN_NAME=tacfos.tech
SECURITY_ALERT_EMAIL=admin@tacfos.tech
MASTER_ADMIN_SECRET=<your-openssl-rand-hex-32-output>

# PostgreSQL Database Connection:
# Reference Railway's PostgreSQL service variable directly:
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Stripe Billing:
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# AI Infrastructure:
NVIDIA_API_KEY=nvapi-...
NVIDIA_MODEL=meta/llama-3.2-90b-vision-instruct
```

3. Save the variables. Railway will automatically trigger a build and deployment.

---

### Step 4: Attach Custom Domain (`tacfos.tech`)

1. In your **FoundryOS** service, go to **Settings** $\rightarrow$ **Networking** $\rightarrow$ **Custom Domains**.
2. Enter **`tacfos.tech`** (and optionally `www.tacfos.tech`).
3. Railway will generate the DNS CNAME record (e.g. `tacfos.tech.up.railway.app`).
4. Log into your DNS provider and add the CNAME record pointing `tacfos.tech` to Railway.
5. Railway will automatically provision a valid SSL/TLS certificate via Let's Encrypt.

---

### Step 5: Database Migration & Verification

The application startup script automatically synchronizes the PostgreSQL schema on boot whenever `DATABASE_URL` is set.

To run or verify migrations manually via Railway CLI / local terminal against your production database:

```bash
# 1. Set your production DATABASE_URL locally:
export DATABASE_URL="postgresql://postgres:password@host:port/railway?sslmode=require"

# 2. Deploy all pending Prisma migrations:
npm run db:migrate:postgres

# 3. Check migration status:
npm run db:migrate:status
```

---

## 🔍 Verification & Health Check

Once deployed, verify the full-stack deployment:

1. **API Health Check:**
   ```bash
   curl -s https://tacfos.tech/api/health | jq
   ```
   **Expected Response:**
   ```json
   {
     "ok": true,
     "service": "foundryos-api",
     "nvidiaConfigured": true,
     "stripeConfigured": true,
     "masterAdminConfigured": true,
     "database": "prisma_postgresql",
     "databaseConfigured": true,
     "userCount": 0,
     "timestamp": "2026-09-03T00:00:00.000Z"
   }
   ```

2. **Web Application & PWA:**
   - Open **`https://tacfos.tech`** in Chrome / Safari / Edge.
   - Confirm landing page, onboarding flow, and dashboard render with zero console errors.
