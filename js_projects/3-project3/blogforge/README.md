# BlogForge

A production-grade full-stack blog platform built with Next.js, Prisma, and PostgreSQL.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 with JWT sessions
- **Styling**: Tailwind CSS + @tailwindcss/typography
- **Editor**: @uiw/react-md-editor (Markdown with live preview)

## Features
- Secure registration and login (bcrypt + JWT)
- Create, edit, delete, and publish blog posts
- Markdown editor with live preview
- Like system with optimistic UI
- Comment section
- Public author profiles
- Protected routes via middleware
- SSR for public pages, CSR for interactive features

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up PostgreSQL (Docker)
```bash
docker run --name blogforge-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=blogforge \
  -p 5432:5432 -d postgres
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Then edit .env with your values

# Generate NEXTAUTH_SECRET:
openssl rand -base64 32
```

### 4. Run database migrations
```bash
npm run db:migrate
```

### 5. Start the dev server
```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── auth/register/        # POST registration
│   │   ├── posts/                # GET list, POST create
│   │   ├── posts/[id]/           # GET, PATCH, DELETE
│   │   ├── posts/[id]/comments/  # POST comment
│   │   ├── posts/[id]/like/      # POST toggle like
│   │   └── users/[id]/           # GET + PATCH profile
│   ├── (auth)/
│   │   ├── login/                # Login page
│   │   └── register/             # Register page
│   ├── blog/
│   │   └── [slug]/               # Single post (SSR + CSR islands)
│   ├── dashboard/                # Author dashboard
│   ├── posts/
│   │   ├── new/                  # Create post
│   │   └── edit/[id]/            # Edit post
│   └── profile/[id]/             # Public profile
├── components/
│   ├── dashboard/DeletePostButton.tsx
│   ├── layout/Navbar.tsx + NavActions.tsx
│   ├── posts/PostEditor.tsx + PostActions.tsx
│   ├── profile/EditProfileForm.tsx
│   └── providers/SessionProvider.tsx
├── lib/
│   ├── auth.ts       # NextAuth config
│   ├── prisma.ts     # Singleton client
│   └── utils.ts      # slug, formatDate, truncate
├── middleware.ts      # Route protection
└── types/
    └── next-auth.d.ts # Session type extension
```

## Database Scripts
```bash
npm run db:migrate   # Run migrations (dev)
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema without migration
```
