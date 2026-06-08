# StreamForge 🎬

A full-stack YouTube clone built with **Next.js 14**, **TypeScript**, **PostgreSQL**, **Prisma**, and **NextAuth**. Features video uploading, nested comments, like/dislike with optimistic UI, channel subscriptions, and an AI-powered description generator.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| Auth | NextAuth v4 + Prisma Adapter |
| Storage | UploadThing |
| AI | OpenAI gpt-4o-mini |
| Dev infra | Docker Compose |
| Deployment | Vercel + Supabase/Neon |

## Local Development Setup

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- An [UploadThing](https://uploadthing.com) account (free tier works)
- An [OpenAI](https://platform.openai.com) API key

### 1. Clone and install

```bash
git clone <your-repo-url>
cd streamforge
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:
- Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`
- Create a Google OAuth app at [console.cloud.google.com](https://console.cloud.google.com)
  - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Create a GitHub OAuth app at [github.com/settings/developers](https://github.com/settings/developers)
  - Callback URL: `http://localhost:3000/api/auth/callback/github`
- Get UploadThing keys from your dashboard
- Get your OpenAI API key

### 3. Start PostgreSQL

```bash
docker compose up -d
```

This spins up a PostgreSQL 16 container on port `5432`.

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed with mock data

```bash
npm run db:seed
```

This creates 3 users, 6 videos, comments, replies, likes, and subscriptions.

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Prisma Studio (optional)

```bash
npm run db:studio
```

Opens a GUI at `http://localhost:5555` to browse your database.

---

## Project Structure

```
streamforge/
├── docker-compose.yml          # Local PostgreSQL container
├── prisma/
│   ├── schema.prisma           # Full DB schema with all relations
│   └── seed.ts                 # Mock data seeder
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   ├── videos/             # CRUD + search
│   │   │   ├── comments/           # Create, list, delete
│   │   │   ├── likes/              # Toggle like/dislike
│   │   │   ├── subscriptions/      # Subscribe/unsubscribe
│   │   │   └── ai/describe/        # OpenAI description generator
│   │   ├── watch/[id]/             # Video watch page
│   │   ├── subscriptions/          # Subscriptions feed
│   │   ├── profile/[id]/           # User channel page
│   │   ├── layout.tsx              # Root layout with Navbar + Sidebar
│   │   └── page.tsx                # Home feed
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Search, upload button, auth menu
│   │   │   └── Sidebar.tsx         # Nav links
│   │   ├── video/
│   │   │   ├── VideoCard.tsx       # Feed grid card
│   │   │   ├── VideoPlayer.tsx     # react-player wrapper
│   │   │   ├── LikeButtons.tsx     # Optimistic like/dislike
│   │   │   ├── SubscribeButton.tsx # Optimistic subscribe
│   │   │   └── UploadModal.tsx     # Upload form + AI helper
│   │   └── comments/
│   │       └── CommentSection.tsx  # Nested comments + replies
│   ├── lib/
│   │   ├── prisma.ts               # Singleton Prisma client
│   │   ├── auth.ts                 # NextAuth config
│   │   └── utils.ts                # formatViews, formatDuration, etc.
│   └── types/
│       ├── index.ts                # Prisma payload types for components
│       └── next-auth.d.ts          # Session type augmentation
```

## Key Architecture Decisions

**Why NextAuth v4 (not v5)?** NextAuth v5 is still in beta and has known Prisma adapter incompatibilities with Next.js 14 App Router. v4 is stable and battle-tested.

**N+1 prevention:** All feed queries use Prisma `include` with `_count` to fetch related counts in a single query. Never doing `video.comments.length` after the fact.

**Optimistic UI:** `LikeButtons` and `SubscribeButton` update local state immediately on click, then sync with the server. State rolls back on error.

**JWT session strategy:** Using `strategy: 'jwt'` so we can read session in React Server Components via `getServerSession()` without a database round-trip.

## Deployment

### Database (Supabase)
1. Create a project at [supabase.com](https://supabase.com)
2. Copy the connection string (use the "Connection Pooling" URL for Vercel)
3. Update `DATABASE_URL` in Vercel env vars

### App (Vercel)
1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add all env vars from `.env.example`
4. Deploy — Next.js is auto-detected

### After deploying
```bash
# Run migrations against production DB
DATABASE_URL="<your-supabase-url>" npx prisma migrate deploy
```

## Phase Roadmap

- [x] Phase 1 — Docker + Prisma schema + seed
- [x] Phase 2 — NextAuth + Navbar + Sidebar
- [x] Phase 3 — Upload modal + OpenAI integration + home feed
- [x] Phase 4 — Watch page + comments + likes + subscribe
- [ ] Phase 5 — Profile page + UploadThing file uploads + Vercel deploy
