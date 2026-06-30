# FailLog — Feature Checklist

Use this as the literal build order. Check items off as Claude Code/Codex
completes them. Don't start a later week's items until the current week's
are done and tested — this is the main defense against scope creep.

## Week 1 — Foundation & Pipeline
- [ ] Create Supabase project, save URL + anon key
- [ ] Create Next.js app (TypeScript + Tailwind) locally
- [ ] Push empty scaffold to GitHub (public repo)
- [ ] Connect repo to Vercel, confirm auto-deploy works on an empty page
- [ ] Add `.env.local` with Supabase keys, confirm `.gitignore` covers it
- [ ] Create `profiles`, `failures`, `upvotes` tables in Supabase
- [ ] Enable RLS on all three tables, write policies from SECURITY_ACCESS.md

## Week 2 — Auth
- [ ] Set up Google OAuth client in Google Cloud Console
- [ ] Connect Google provider in Supabase Auth settings
- [ ] Build `/login` page with "Continue with Google" button
- [ ] Confirm new user → auto profile row created (trigger working)
- [ ] Navbar shows login state (avatar vs login button)
- [ ] Logout works

## Week 3 — Create Post
- [ ] Build `PostForm.tsx` per FRONTEND_SPEC
- [ ] Wire category dropdown (fixed enum)
- [ ] Wire tag chip input
- [ ] Wire optional image upload to Supabase Storage
- [ ] Submit → insert row into `failures`, redirect to detail page
- [ ] Form validation (required fields, max lengths)

## Week 4 — Feed
- [ ] Build `FailureCard.tsx` per spec
- [ ] Feed page fetches paginated `failures`, newest first
- [ ] Infinite scroll with skeleton loading state
- [ ] Category badges render with correct color map

## Week 5 — Search, Filter, Detail
- [ ] Search bar (debounced, filters by title/problem text)
- [ ] Filter bar (category single-select, tag multi-select)
- [ ] Detail page `/failure/[id]` — full structured layout
- [ ] "Similar failures" UI slot stubbed (no logic, just placeholder)

## Week 6 — Upvotes, Polish, Ship
- [ ] `UpvoteButton.tsx` — toggle vote, optimistic UI
- [ ] Postgres trigger to keep `upvote_count` in sync
- [ ] Mobile responsive pass
- [ ] Microinteractions (hover, bounce, toast on post success)
- [ ] Write README.md (screenshots, live link, stack badges, setup steps)
- [ ] Final deploy check on Vercel production URL

## Week 7 — Failure Chains (v1.5 — signature differentiator)
Do not start this until Weeks 1-6 are fully functional and deployed.
This is the one standout feature, not a pile of extra features — keep
scope tight to exactly what's below.
- [ ] Run migration: add `parent_failure_id` + `outcome` columns to `failures`
- [ ] Create-post form: optional "Link to a previous attempt" search field
- [ ] Recursive query (Postgres `WITH RECURSIVE`) to fetch a post's full
      ancestor chain
- [ ] Query to fetch direct children (other attempts retrying this post)
- [ ] Timeline UI component on detail page per FRONTEND_SPEC.md 2.3.1
- [ ] Outcome selector (Failed / Partial / Resolved) on create-post form,
      optional field
- [ ] Verify: a standalone post with no chain renders completely normally
      (timeline UI doesn't appear, no broken layout)
- [ ] Post at least 2-3 real linked posts yourself to demo the feature
      working before considering it "done"

## v2 Backlog (do NOT build now — just track here)
- [ ] Comments/replies on failure posts
- [ ] User profile pages (public, showing their post history)
- [ ] "Similar failures" recommendation logic
- [ ] Notifications
- [ ] Admin moderation dashboard
- [ ] University-level analytics dashboard
- [ ] Verified/premium failure reports (monetization)
- [ ] Echo reaction ("this happened to me too") — separate signal from
      upvotes, own table similar to `upvotes`. Deferred until core app +
      Failure Chains are shipped and real usage shows it's worth adding.

## Definition of Done (for any feature)
A feature isn't "done" until:
1. It works on mobile and desktop
2. It's covered by an RLS policy if it touches the DB
3. It's deployed and tested on the live Vercel URL, not just localhost
