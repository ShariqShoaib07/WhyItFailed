# FailLog — Technical Architecture

## 1. Stack Overview

| Layer | Tool | Tier |
|---|---|---|
| Frontend framework | Next.js (App Router, TypeScript) | Free |
| Styling | Tailwind CSS | Free |
| Database | Supabase Postgres | Free tier (500MB) |
| Auth | Supabase Auth (Google OAuth provider) | Free |
| File storage | Supabase Storage (post images) | Free tier (1GB) |
| Hosting | Vercel | Free (Hobby plan) |
| Version control | GitHub | Free |
| OAuth credentials | Google Cloud Console | Free |

No paid service required to ship v1.

## 2. High-Level Data Flow

```
Browser (Next.js app, hosted on Vercel)
   │
   ├── Supabase client SDK (browser-safe, anon key)
   │       │
   │       ▼
   │   Supabase Postgres + Auth + Storage
   │       │
   │       ▼
   │   Row Level Security (RLS) policies enforce who can read/write what
   │
   └── Google OAuth (handled by Supabase Auth, redirect flow)
```

There is no custom backend server. Supabase's auto-generated REST/Postgrest
API + client SDK replaces a hand-rolled Express/Node backend. This keeps
the project small enough to maintain solo at a few hours/week.

## 3. Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, FK → auth.users.id |
| name | text | from Google profile |
| university | text | nullable, optional self-reported |
| created_at | timestamptz | default now() |

### `failures`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK → profiles.id |
| title | text | required |
| category | text | enum-constrained at app level |
| problem | text | required |
| what_tried | text | required |
| why_failed | text | required |
| tags | text[] | nullable |
| image_url | text | nullable |
| upvote_count | int | default 0, denormalized counter |
| created_at | timestamptz | default now() |

### `upvotes`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| failure_id | uuid | FK → failures.id |
| user_id | uuid | FK → profiles.id |
| created_at | timestamptz | default now() |
| | | UNIQUE(failure_id, user_id) — enforces one vote per user |

### Trigger
A Postgres trigger on `upvotes` insert/delete updates `failures.upvote_count`
automatically, so the frontend never has to compute counts client-side.

## 4. API / Data Access Pattern
- All reads/writes go through the Supabase JS client directly from
  Next.js Server Components (for initial page loads) and Client Components
  (for interactive bits like the upvote button).
- No custom API routes needed for v1 CRUD. Use Next.js Route Handlers only
  if/when logic needs to run server-side with the service role key
  (e.g., future moderation features).

## 5. Image Uploads
- Stored in a Supabase Storage bucket `failure-images`
- Client uploads directly from browser using Supabase Storage SDK
- Public read access on the bucket; write access restricted to
  authenticated users (see SECURITY_ACCESS.md)

## 6. Folder Structure
```
faillog/
├── app/
│   ├── page.tsx                 → feed (home)
│   ├── login/page.tsx
│   ├── new/page.tsx             → create post form
│   ├── failure/[id]/page.tsx    → detail page
│   ├── profile/[id]/page.tsx    → user's own posts (v1.5)
│   └── layout.tsx
├── components/
│   ├── FailureCard.tsx
│   ├── FilterBar.tsx
│   ├── SearchBar.tsx
│   ├── UpvoteButton.tsx
│   ├── CategoryBadge.tsx
│   └── Navbar.tsx
├── lib/
│   ├── supabaseClient.ts        → browser client
│   ├── supabaseServer.ts        → server component client
│   └── types.ts
├── public/
├── .env.local                   → NEVER commit
└── package.json
```

## 7. Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
Both come from the Supabase project dashboard. The anon key is safe for
browser exposure because RLS policies gate actual data access.

## 8. Deployment Pipeline
1. Push to GitHub `main` branch
2. Vercel auto-builds and deploys (connected via Vercel's GitHub integration)
3. Environment variables set once in Vercel project settings, not in repo

## 9. Scaling Notes (not needed for v1, just awareness)
- Supabase free tier caps at 500MB DB and 50k monthly active users —
  far beyond what's needed for an ITU-scale launch
- If image storage becomes a bottleneck, compress on upload client-side
  before sending to Storage
