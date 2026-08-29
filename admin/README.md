# ZetaGrow Admin

Admin dashboard for ZetaGrow platform management.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Convex (real-time database & functions)
- **Deployment**: Vercel

## Features

- **Users**: View, search, manage users & roles
- **Programs**: CRUD for learning programs & modules
- **Achievements**: Manage achievements, positions, badges
- **Affiliate**: Commission settings, sales tracking, referrals
- **Finance**: Withdrawal requests, wallet management
- **Communications**: Support tickets, announcements, contact inquiries
- **Audit Logs**: Immutable admin action trail
- **Settings**: Platform-wide configuration

## Getting Started

### Prerequisites

- Node.js 18+
- Convex account (shared with website)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOYMENT=your_convex_deployment_id
NEXT_PUBLIC_SITE_URL=https://admin.yourdomain.com
```

### Development

```bash
npm run dev          # Start dev server on port 3001
npm run dev:clean    # Clean start (clears .next, node_modules cache)
npm run build        # Production build
npm run start        # Start production server
```

### Convex Setup

```bash
npx convex dev       # Start Convex dev server (from root project)
npx convex deploy    # Deploy to production (from root project)
```

## Project Structure

```
src/
├── app/
│   ├── (admin)/       # Protected admin routes
│   │   ├── achievements/
│   │   ├── affiliate/
│   │   ├── audit-logs/
│   │   ├── communications/
│   │   ├── finance/
│   │   ├── plans/
│   │   ├── programs/
│   │   ├── settings/
│   │   ├── users/
│   │   └── work/
│   ├── login/         # Admin login page
│   └── layout.tsx     # Root layout
├── lib/
    └── convex.tsx     # Convex client & admin auth hooks
```

## Admin Authentication

Admin access is controlled via Convex `users` table with `role` field:
- `super_admin` — Full access
- `admin` — General admin access
- `content_admin` — Content management
- `finance_admin` — Finance & withdrawals
- `work_admin` — Work marketplace

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