# ZetaGrow — User Platform

Online learning platform for India offering certificate courses in digital marketing, e-commerce, coding, AI tools and communication. Built with Next.js 14, Convex, and Tailwind CSS.

## Features

- 📚 **4 Learning Plans** — tiered bundles with 28 courses, 207 text-based lessons
- 🏆 **Verified Certificates** — publicly verifiable with unique IDs
- 💼 **Work Marketplace** — curated gig & freelance opportunities for qualified learners
- 🔗 **Referral Program** — single-level commissions with consumption verification
- 📱 **Fully Responsive** — mobile-first design with swipe navigation

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend | Convex (TypeScript, serverless) |
| Auth | Custom JWT sessions |
| Hosting | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your Convex deployment URL

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (for SEO/canonical) |

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel (Root Directory: `.`)
3. Set environment variables
4. Deploy

## License

All rights reserved. © ZetaGrow
