# ZetaGrow — Digital Education & Work Platform

ZetaGrow is an integrated, production-grade digital education and verified work platform built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Convex**.

---

## 🌟 Core Architecture & Principles

- **Independent Applications**:
  - `/website`: User-facing public website, authentication, and comprehensive student & contractor dashboard (Port 3000).
  - `/admin`: Independent administrative portal for curriculum, work marketplace, affiliate rules, financial payouts, and system governance (Port 3001).
  - `/convex`: Centralized Convex backend (`https://terrific-dove-836.convex.cloud`).
  - `/shared`: Shared domain interfaces, constants, and utilities.

- **Admin-Configurable Rules Engine**:
  - Commission calculation formulas (including 50% lower-program calculation).
  - Program pricing and curriculum syllabus.
  - Work eligibility requirements (required program, required achievements).
  - Dynamic achievement criteria (ALL / ANY condition logic across metrics).
  - Withdrawal limits and processing fees.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
npm --prefix website install
npm --prefix admin install
```

### 2. Run Applications

**Start User Website (Port 3000):**
```bash
npm run dev:website
```

**Start Admin Portal (Port 3001):**
```bash
npm run dev:admin
```

---

## 🔐 Demo Accounts (Pre-Seeded)

### Super Administrator
- **Portal URL**: `http://localhost:3001/login`
- **Email**: `admin@zetagrow.com`
- **Password**: `AdminPassword123!`

### Demo User / Contractor
- **Portal URL**: `http://localhost:3000/login`
- **Email**: `demo@zetagrow.com`
- **Password**: `DemoPassword123!`
- **Referral Code**: `DEMO123`

---

## 📦 Features Overview

1. **Curriculum Tiers**:
   - Starter Digital Skills (₹2,000)
   - Growth Professional (₹4,000)
   - Digital Business Execution (₹8,000)
   - Digital Business Pro (₹14,000)
2. **Interactive Course Player**: Module navigation, video & markdown reading, downloadable assets, completion tracking, automatic certificate issuance on 100% course completion.
3. **Verified Credential Registry**: Public verification route at `/certificate/[certificateId]`.
4. **Work Marketplace**: Gated by program/achievement requirements, deliverable submissions, and milestone wallet payouts.
5. **Affiliate & Referral Engine**: Unique referral codes, automated attribution, configurable lower-program commission calculation, and transaction ledger.
6. **Wallet & Withdrawals**: Live limit & fee validation, UPI and Bank Transfer support, and immutable financial ledger.
7. **Achievement Rule Builder**: Dynamic condition metrics (`affiliate_sales`, `completed_jobs`, `completed_programs`, etc.) with ALL/ANY condition matching.
8. **Security & Audit Logs**: Cryptographic password hashing (PBKDF2/SHA-256 with user salt), server-side authorization on all mutations, and immutable admin audit trail.

---

## 📋 Documentation

- `docs/admin-audit-report.md` — Full admin panel audit, API test cases, and verification report (Aug 2026).
