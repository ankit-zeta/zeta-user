# ZetaGrow Website

The user-facing frontend for ZetaGrow — a learning, work, and growth platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Convex (real-time database & functions)
- **Deployment**: Vercel

## Features

- Public marketing pages (landing, programs, plans, policies)
- User authentication (signup, login, password reset)
- Dashboard with:
  - Learning modules & course player
  - Achievements & positions
  - Affiliate & referral center
  - Work marketplace
  - Wallet & withdrawals
  - Support tickets
  - Notifications
  - Resources library

## Getting Started

### Prerequisites

- Node.js 18+
- Convex account (for backend)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOYMENT=your_convex_deployment_id
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Development

```bash
npm run dev          # Start dev server on port 3000
npm run dev:clean    # Clean start (clears .next, node_modules cache)
npm run build        # Production build
npm run start        # Start production server
```

### Convex Setup

```bash
npx convex dev       # Start Convex dev server
npx convex deploy    # Deploy to production
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, signup, forgot-password)
│   ├── (public)/        # Public marketing pages
│   ├── dashboard/       # Protected user dashboard
│   └── layout.tsx       # Root layout
├── components/          # Shared UI components
└── lib/
    └── convex.tsx       # Convex client & hooks
```

## Deployment

### Vercel

1. Import this repository in Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

The `vercel.json` configures:
- Build command: `next build`
- Output directory: `.next`
- Region: `bom1` (Mumbai)

## No Sensitive Data

This repo contains **no secrets**. All sensitive values are in `.env.local` (gitignored) or Vercel environment variables.

## License

Private — ZetaGrow proprietary codebase.