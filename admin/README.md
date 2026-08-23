# ZetaGrow — Admin Panel

Admin dashboard for the ZetaGrow learning platform. Manage plans, courses, achievements, users, work marketplace, affiliate settings, and platform configuration.

## Features

- 📦 **Plans & Bundles Manager** — create/edit/delete learning plan bundles
- 📖 **Course Builder** — full CRUD for programs, modules, and lessons (text/video/quiz)
- 🏆 **Achievements Builder** — metric-based achievement rules with position unlocks
- 👥 **User Management** — search, suspend, role assignment, wallet adjustments
- 💼 **Work Marketplace** — job CRUD, application review, deliverable management
- 💰 **Finance** — withdrawal approvals, wallet adjustments, payout methods
- ⚙️ **Platform Settings** — affiliate engine, commission rates, chain levels

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend | Convex (TypeScript, serverless) |
| Auth | Custom JWT sessions with admin role checks |
| Hosting | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your Convex deployment URL

# Run development server (port 3001)
npm run dev

# Build for production
npm run build
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `NEXT_PUBLIC_SITE_URL` | Admin panel URL |

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel (Root Directory: `.`)
3. Set environment variables
4. **Enable Deployment Protection** (Settings → Deployment Protection) — recommended for admin security
5. Deploy

## License

All rights reserved. © ZetaGrow
