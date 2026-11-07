# Nudy — 18+ Fictional AI Character Image & Video Studio

Nudy is a production-ready generative AI web application engineered for creating, customizing, and rendering persistent fictional adult characters (18+ only) in photorealistic images and high-fidelity video motion.

---

## 🔒 Safety, Compliance & Regulatory Architecture

Nudy enforces non-negotiable statutory safeguards in accordance with international child protection laws, copyright standards, and adult media regulations:

1. **Age Gating & KYC Identity Verification**:
   - Client-side full-screen modal gate confirming 18+ legal adult status before any UI is exposed.
   - Server-enforced KYC identity verification (`IKYCProvider` interface): **Zero generations are permitted without a verified account**.
2. **Multi-Stage Prompt Moderation**:
   - Zero-tolerance lexical, semantic, and regex blocking for:
     * Minors, children, teen terminology, school contexts, or leetspeak obfuscation (CSAM/CSAE).
     * Non-consensual content, sexual violence, coercion, or intoxication.
     * Real living persons, politicians, and celebrities (deepfake prevention).
     * Extreme violence, gore, mutilation, and bestiality.
   - Comprehensive unit test suite (`src/lib/moderation/promptFilter.test.ts`) validating safety boundaries.
3. **Apparent Age Enforcement**:
   - UI character creator enforces a strict **minimum apparent age of 21 years**.
   - Database and API level enforce minimum apparent age of $\ge 18$ years.
4. **Private By Default**:
   - No public feed, discovery wall, or social sharing of generations.
   - Media stored with private ACLs in S3/R2 storage, accessed exclusively via short-lived cryptographic pre-signed URLs.
5. **Post-Generation Output Classifier**:
   - Pluggable `IOutputClassifier` hook that inspects rendered image and video frames prior to returning assets to user storage.
6. **Statutory Documentation**:
   - [Terms of Service](src/app/legal/terms/page.tsx)
   - [Content Policy & Safety Guidelines](src/app/legal/content-policy/page.tsx)
   - [18 U.S.C. § 2257 Record-Keeping Exemption Statement](src/app/legal/2257/page.tsx)
   - [Privacy & KYC Retention Notice](src/app/legal/privacy/page.tsx)
   - [DMCA & Likeness Takedown Submission Form](src/app/legal/dmca/page.tsx)
   - Cookie & Consent Banner
7. **GDPR / CCPA Rights**:
   - One-click machine-readable JSON data export (`/api/user/export`).
   - Permanent cryptographic account deletion and asset purging (`/api/user/delete`).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide icons, Dark Mode by default.
- **Backend**: Next.js Route Handlers, Prisma ORM, PostgreSQL (with SQLite zero-dependency local dev mode).
- **Generation Engine**: Provider abstraction (`IGenerationProvider`) with adapters for:
  - **ComfyUI**: Self-hosted WebSocket & HTTP workflow runner (SDXL / Flux / CogVideo / SVD).
  - **Generic REST**: External inference APIs (RunPod Serverless, Fal.ai, or custom model servers).
  - **Mock Sandbox**: Local zero-GPU development and CI testing adapter.
- **Storage**: S3-compatible interface (`IStorageProvider`) with private bucket isolation and expiring signed view tokens.
- **Billing & Ledger**: Double-entry ledger (`credits_ledger`, `subscriptions`), webhook listener, swappable for adult-friendly merchant accounts (CCBill, Segpay, Epoch) or Stripe.

---

## 🚀 Quickstart & Setup Instructions

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository and install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration is preset to run locally in zero-dependency test mode (SQLite, Mock KYC, Mock Generation, Mock Storage).

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to local database
npx prisma db push

# Seed test accounts, sample characters, and generations
npm run prisma:seed
```

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Seed Test Accounts

The seed script creates 3 ready-to-test accounts:

| Role | Email | Password | Status | Credits |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@nudy.local` | `AdminPassword18+!` | 18+ Verified | 1,000 |
| **Creator** | `creator@nudy.local` | `CreatorPassword18+!` | 18+ Verified | 250 |
| **Unverified** | `newuser@nudy.local` | `UserPassword18+!` | Unverified (Test KYC gate) | 50 |

---

## 🧪 Running Safety & Moderation Unit Tests

```bash
# Run Vitest test suite on prompt moderation filters
npm test
```

---

## 📂 Project Structure

```
├── prisma/
│   ├── schema.prisma              # Primary SQLite / Local Prisma schema
│   ├── schema.postgresql.prisma   # PostgreSQL production schema
│   └── seed.js                    # Database seeder with test accounts & characters
├── src/
│   ├── app/
│   │   ├── admin/page.tsx         # Compliance & moderation queue
│   │   ├── api/                   # Secure Next.js API route handlers
│   │   │   ├── admin/reports/     # Review queue & ban controls
│   │   │   ├── auth/              # Login, Signup, Session, Logout
│   │   │   ├── billing/           # Checkout & Webhooks
│   │   │   ├── characters/        # Character profile management
│   │   │   ├── generate/          # Generation dispatcher with safety gates
│   │   │   ├── generations/       # Private gallery API
│   │   │   ├── jobs/[id]/status/  # Live queue polling
│   │   │   ├── kyc/verify/        # Age verification submission
│   │   │   ├── reports/           # User report endpoint
│   │   │   └── user/              # GDPR data export & account deletion
│   │   ├── characters/page.tsx    # Fictional character builder (age >= 21 UI)
│   │   ├── create/page.tsx        # Creation studio (Image & Video)
│   │   ├── credits/page.tsx       # Credits ledger & subscription tiers
│   │   ├── gallery/page.tsx       # Private creator gallery
│   │   ├── legal/                 # Statutory legal & compliance pages
│   │   │   ├── 2257/page.tsx      # 18 U.S.C. 2257 Exemption Notice
│   │   │   ├── content-policy/    # Rules & zero-tolerance standards
│   │   │   ├── dmca/page.tsx      # Takedown submission form
│   │   │   ├── privacy/page.tsx   # Privacy & KYC retention
│   │   │   └── terms/page.tsx     # Terms of Service
│   │   ├── settings/page.tsx      # Account, KYC stub, export & deletion
│   │   ├── layout.tsx             # Root layout with Age Gate & Cookie banner
│   │   └── page.tsx               # Landing dashboard
│   ├── components/
│   │   ├── AgeGateModal.tsx       # Full-screen 18+ entry gate
│   │   ├── CookieBanner.tsx       # Cookie & consent banner
│   │   └── NavigationSidebar.tsx  # Responsive navigation sidebar
│   └── lib/
│       ├── auth/                  # JWT and password hashing
│       ├── db.ts                  # Prisma Client singleton
│       ├── generation/            # Engine interface, ComfyUI & Generic adapters
│       ├── kyc/                   # KYC provider interface (Persona, Mock)
│       ├── moderation/            # Prompt filter, output classifier & tests
│       ├── payments/              # Payment processor interface
│       └── storage/               # Private S3 & presigned URL manager
├── .env.example                   # Full environment variables template
└── vitest.config.ts               # Unit test configuration
```

---

## 📋 Production Deployment Checklist (TODO for User Input)

To move this application from development to live production, the following credentials and vendor configurations are required:

1. **Inference Generation Backend**:
   - `GENERATION_PROVIDER`: Set to `comfyui` or `generic_rest`.
   - `COMFYUI_HTTP_URL` / `COMFYUI_WS_URL`: Address of your GPU host running ComfyUI with SDXL / Flux / SVD models.
   - `GENERIC_REST_API_KEY`: API key for RunPod Serverless, Fal.ai, or custom inference host.
2. **KYC / Age Verification Vendor**:
   - `KYC_PROVIDER`: Set to `persona`, `veriff`, or `sumsub`.
   - `KYC_API_KEY` & `KYC_API_SECRET`: Credentials from chosen verification partner.
   - `KYC_WEBHOOK_SECRET`: HMAC signature verification key for asynchronous webhook confirmations.
3. **Payment Processor**:
   - `PAYMENT_PROVIDER`: High-risk/adult-friendly processor (CCBill, Segpay, Epoch) or standard provider.
   - `PAYMENT_API_KEY` & `PAYMENT_WEBHOOK_SECRET`: Merchant credentials.
4. **Cloud Object Storage**:
   - `STORAGE_PROVIDER`: Set to `s3`, `r2` (Cloudflare R2 recommended for zero egress fees), or `minio`.
   - `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`.
5. **Production PostgreSQL**:
   - Deploy PostgreSQL instance (e.g. AWS RDS, Supabase, Neon).
   - Set `DATABASE_URL` in `.env` and run `npx prisma db push`.

