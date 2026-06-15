# StreamForge — Full-Stack YouTube Clone

A fully functional YouTube clone built with Next.js 14 App Router, TypeScript, Prisma, PostgreSQL, NextAuth, and Cloudinary.

## Features

- **Auth** — Email/password + GitHub OAuth via NextAuth
- **Video upload** — Direct-to-Cloudinary with HLS adaptive streaming
- **Home feed** — Infinite scroll, trending/recent sort, tag filters
- **Channel pages** — Banner, bio, subscriber count, subscribe button
- **Subscriptions feed** — Videos from channels you follow
- **Likes/dislikes** — Optimistic UI, upsert-based reactions
- **Nested comments** — 3-level deep threaded replies
- **Full-text search** — PostgreSQL tsvector + GIN index
- **Watch history** — Grouped by date, auto-recorded on play
- **Watch later** — Save/unsave any video
- **Notifications** — Real-time via Server-Sent Events (SSE)
- **Creator studio** — Analytics dashboard with Recharts charts
- **Video management** — Edit title/status/tags, delete videos
- **Profile settings** — Avatar, banner, bio, handle, password

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js v4 |
| Storage | Cloudinary |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Video | hls.js |
| Validation | Zod |

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd streamforge
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Fill in all values in .env.local
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
# Then apply the search vector migration:
psql $DATABASE_URL -f prisma/migrations/add_search_vector.sql
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel + Neon)

1. Push to GitHub
2. Import repo in Vercel
3. Add all env vars in Vercel dashboard
4. Update GitHub OAuth callback URL to your production domain
5. Update Cloudinary webhook URL to `https://your-domain.vercel.app/api/cloudinary/webhook`
6. Deploy

## Project Structure

```
streamforge/
├── app/                    # Next.js App Router pages + API routes
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Shared utilities (prisma, auth, cloudinary)
├── prisma/                 # Schema + migrations
└── types/                  # TypeScript type definitions
```
