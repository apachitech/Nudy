# Nudy — Production Deployment & API Keys Guide

This guide walks you through **where to obtain every required external API key** and provides **step-by-step instructions to deploy Nudy to production**.

---

## 🔑 PART 1: Where to Get Every API Key & Service

### 1. AI Generation Inference Backend
Nudy is engineered with a swappable engine adapter. You can choose either:

#### Option A: Serverless Inference API (Easiest & Pay-Per-Generation)
- **RunPod Serverless** (Recommended for uncensored models):
  1. Go to [https://runpod.io](https://runpod.io) and create an account.
  2. Navigate to **Serverless** &rarr; Select an **SDXL / Flux / Animatediff** endpoint or deploy your own worker.
  3. Go to **Settings** &rarr; **API Keys** &rarr; Click **Create API Key**.
  4. In your `.env`:
     ```env
     GENERATION_PROVIDER="generic_rest"
     GENERIC_REST_API_URL="https://api.runpod.ai/v2/<YOUR_ENDPOINT_ID>/runsync"
     GENERIC_REST_API_KEY="your-runpod-api-key"
     ```
- **Fal.ai**:
  1. Go to [https://fal.ai](https://fal.ai) &rarr; Sign up and go to **Keys**.
  2. Copy your `FAL_KEY` and set it as `GENERIC_REST_API_KEY`.

#### Option B: Self-Hosted ComfyUI (Full Control & Open-Weights)
- Rent a GPU on [Vast.ai](https://vast.ai) or [RunPod](https://runpod.io) ($0.20–$0.40/hr with RTX 4090 / A5000):
  1. Deploy the `runpod/comfyui` template.
  2. Install open-weight checkpoints (`sd_xl_base_1.0.safetensors`, `svd_xt_1_1.safetensors`).
  3. Start ComfyUI with `--listen 0.0.0.0 --port 8188`.
  4. In your `.env`:
     ```env
     GENERATION_PROVIDER="comfyui"
     COMFYUI_HTTP_URL="http://<YOUR_GPU_IP>:8188"
     COMFYUI_WS_URL="ws://<YOUR_GPU_IP>:8188/ws"
     ```

---

### 2. Third-Party KYC & Age Verification
To enforce legal adult compliance, connect a certified KYC provider:

- **Persona (Recommended)**:
  1. Sign up at [https://withpersona.com](https://withpersona.com).
  2. Go to **Integration** &rarr; **API Keys** &rarr; Generate an **API Key**.
  3. Create an **Inquiry Template** configured for Government ID + Age Verification ($\ge 18$).
  4. Go to **Webhooks** &rarr; Add endpoint `https://your-domain.com/api/kyc/verify` &rarr; Copy the **Signing Secret**.
  5. In your `.env`:
     ```env
     KYC_PROVIDER="persona"
     KYC_API_KEY="persona_sandbox_..."
     KYC_WEBHOOK_SECRET="whsec_..."
     ```
- **Veriff**:
  1. Sign up at [https://veriff.com](https://veriff.com) &rarr; Obtain **Public API Key** and **Secret Key**.
- *(Development fallback: Leaving `KYC_PROVIDER="mock"` enables the 1-click verification stub for sandbox testing).*

---

### 3. S3-Compatible Private Storage
Generations are private by default; assets require private S3 buckets and pre-signed expiring view tokens:

- **Cloudflare R2 (Recommended — Zero Egress Bandwidth Fees)**:
  1. Sign up at [https://dash.cloudflare.com](https://dash.cloudflare.com).
  2. Navigate to **R2 Object Storage** &rarr; Click **Create Bucket** (e.g. `nudy-private-assets`).
  3. Click **Manage R2 API Tokens** &rarr; Click **Create API Token** (Permissions: *Object Read & Write*).
  4. Copy **Account ID**, **Access Key ID**, and **Secret Access Key**.
  5. In your `.env`:
     ```env
     STORAGE_PROVIDER="r2"
     S3_ENDPOINT="https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com"
     S3_REGION="auto"
     S3_BUCKET_NAME="nudy-private-assets"
     S3_ACCESS_KEY_ID="your-r2-access-key-id"
     S3_SECRET_ACCESS_KEY="your-r2-secret-access-key"
     S3_FORCE_PATH_STYLE="false"
     ```
- **AWS S3**:
  1. Create a bucket in AWS S3 with **Block all public access = ON**.
  2. Create an IAM User with `AmazonS3FullAccess` and generate Access Keys.

---

### 4. High-Risk / Adult Payment Processors
- **CCBill / Segpay / Epoch**:
  1. Apply for a high-risk merchant account with CCBill ([https://ccbill.com](https://ccbill.com)) or Segpay ([https://segpay.com](https://segpay.com)).
  2. In your Merchant Portal, generate your **Account Number**, **Sub-Account**, and **Dynamic Pricing Salt**.
  3. Set Webhook URL to `https://your-domain.com/api/billing/webhook`.
  4. In your `.env`:
     ```env
     PAYMENT_PROVIDER="ccbill"
     PAYMENT_API_KEY="your-merchant-sub-account"
     PAYMENT_WEBHOOK_SECRET="your-encryption-salt"
     ```
- **Stripe** (If operating under non-explicit artistic fictional guidelines):
  1. Get `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys).

---

### 5. PostgreSQL Database
- **Supabase (Free Tier Available)**:
  1. Go to [https://supabase.com](https://supabase.com) &rarr; Create New Project.
  2. Go to **Settings** &rarr; **Database** &rarr; Copy **Connection String (URI / Pooler)**.
  3. In your `.env`:
     ```env
     DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?schema=public"
     ```
- **Neon**:
  1. Go to [https://neon.tech](https://neon.tech) &rarr; Create Project &rarr; Copy connection string.

---

## 🚀 PART 2: Step-by-Step Production Deployment

### Option 1: 1-Command Deployment via Docker Compose (VPS / Cloud VM)
Ideal for Hetzner, DigitalOcean, AWS EC2, or Linode ($10–$20/mo):

1. **SSH into your server**:
   ```bash
   ssh root@your-server-ip
   ```
2. **Install Docker & Docker Compose**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
   ```
3. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Nudy.git
   cd Nudy
   ```
4. **Configure your production environment**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Fill in your `DATABASE_URL`, `AUTH_SECRET`, `JWT_SECRET`, and provider credentials.*
5. **Launch the entire stack**:
   ```bash
   docker compose up -d --build
   ```
   *This starts PostgreSQL 16, Redis 7, MinIO Storage, and the Next.js web application.*
6. **Run database migrations and seed**:
   ```bash
   docker compose exec web npx prisma db push
   docker compose exec web node prisma/seed.js
   ```
7. **Point your domain**:
   - Set an `A` record on your domain DNS pointing to your server IP.
   - Install Caddy or Nginx for free automatic SSL:
     ```bash
     apt install -y caddy
     caddy reverse-proxy --from yourdomain.com --to 127.0.0.1:3000
     ```

---

### Option 2: Deploy on Vercel + Supabase + Cloudflare R2

1. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/your-username/nudy.git
   git push -u origin master
   ```
2. **Import to Vercel**:
   - Go to [https://vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository.
3. **Configure Environment Variables in Vercel**:
   Add the following variables:
   - `NEXT_PUBLIC_APP_URL` = `https://your-domain.vercel.app`
   - `DATABASE_URL` = *(Your Supabase connection string)*
   - `AUTH_SECRET` = *(Generate with: `openssl rand -base64 32`)*
   - `JWT_SECRET` = *(Generate with: `openssl rand -base64 32`)*
   - `STORAGE_PROVIDER` = `r2`
   - `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
   - `GENERATION_PROVIDER` = `generic_rest` (or `comfyui`)
   - `GENERIC_REST_API_KEY` & `GENERIC_REST_API_URL`
   - `KYC_PROVIDER` = `persona` (or `mock`)
4. **Deploy Database Schema**:
   From your local terminal, point Prisma to the Supabase URL and push:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   DATABASE_URL="postgresql://..." node prisma/seed.js
   ```
5. **Click "Deploy" on Vercel**:
   Your application will be live globally with edge CDN caching, DDoS protection, and automated CI/CD!
