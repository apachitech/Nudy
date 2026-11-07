# Nudy — Authentication & Login Guide

This guide explains how to access, sign in, and test all user roles in **Nudy**.

---

## 🌐 Quick Access URL

- **Login & Settings Page**: [http://localhost:3000/settings](http://localhost:3000/settings)
- **Studio (After login)**: [http://localhost:3000/create](http://localhost:3000/create)
- **Moderation Queue (Admin only)**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛡️ Step 1: 18+ Age Gate Confirmation

When opening the website for the first time in any browser:
1. A full-screen dark modal titled **"Age Verification Required"** will appear.
2. Click **"I am 18 or Older — Enter"**.
3. This sets your legal adult acknowledgment and grants access to the portal.

---

## ⚡ Step 2: Choose Your Login Method

### Option A: 1-Click Demo Quick Buttons (Recommended)

On the [Settings / Login Page](http://localhost:3000/settings), 3 quick-access buttons are available above the form:

1. Click **`Creator (250 Cr)`** &rarr; Automatically populates verified creator credentials.
2. Click **`Admin (1000 Cr)`** &rarr; Automatically populates admin / moderation credentials.
3. Click **`Unverified (50 Cr)`** &rarr; Automatically populates unverified credentials (to test KYC enforcement).
4. Click **"Sign In"**.

---

### Option B: Manual Credentials

Enter any of the following pre-seeded test accounts:

| Role | Email Address | Password | Balance | Verified | Permissions & Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Creator** | `creator@nudy.local` | `CreatorPassword18+!` | **250 Credits** | ✅ Yes | Standard creator account with pre-seeded character profiles (*Elena Vance* & *Aria Thorne*), saved images, and motion videos. |
| **Admin** | `admin@nudy.local` | `AdminPassword18+!` | **1,000 Credits** | ✅ Yes | Full administrative privileges. Unlocks the **Moderation Queue** (`/admin`) to inspect user reports, take down content, ban accounts, and review audit logs. |
| **Unverified** | `newuser@nudy.local` | `UserPassword18+!` | **50 Credits** | ❌ No | Unverified account used to test the **KYC Age Gate**. Generations are blocked (`HTTP 403`) until clicking the **"Complete Age Verification (18+)"** button in Settings. |

---

### Option C: Register a Brand New Account

1. On the login form, click **"Create one"** at the bottom.
2. Fill in:
   - **Your Name**: (e.g., `Alex Hunter`)
   - **Email Address**: (e.g., `alex@domain.com`)
   - **Password**: Minimum 8 characters
3. Click **"Register Account"**.
4. You will immediately receive **50 free welcome credits**.
5. To generate content, go to **Settings** and click **"Complete Age Verification (18+)"** to pass the KYC verification stub.

---

## 🔌 API & Programmatic Authentication

You can authenticate directly using curl or automated scripts:

### 1. Login via API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@nudy.local",
    "password": "CreatorPassword18+!"
  }'
```

**Response**:
```json
{
  "user": {
    "id": "...",
    "email": "creator@nudy.local",
    "name": "Veronica Vance",
    "role": "USER",
    "isAgeVerified": true,
    "creditBalance": 250
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Check Session (`/api/auth/me`)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 3. Sign Out via API
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

---

## 🔄 Resetting / Re-seeding Accounts

If you ever need to reset all test accounts, credits, and passwords back to factory defaults:

```bash
npm run prisma:seed
```
