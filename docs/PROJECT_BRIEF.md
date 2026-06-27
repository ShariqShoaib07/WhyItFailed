# FailLog — Project Brief

## What This Is
FailLog is a web platform where students post structured "failure reports" —
what they tried, what broke, and why — instead of generic forum chatter.
It's framed visually and behaviorally like a social feed (Instagram-style
scroll, cards, like/upvote), but the content type is technical postmortems
instead of photos.

This document is the single source of truth for any developer (human or AI
coding agent) working on this repo. Other docs in this folder go deeper on
specific areas — link them as needed.

## Companion Docs
- `PRD.md` — product requirements, user stories, success metrics
- `TECHNICAL_ARCHITECTURE.md` — stack, data flow, schema, deployment
- `SECURITY_ACCESS.md` — auth rules, permissions, data protection
- `FRONTEND_SPEC.md` — UI/UX spec, Instagram-style feed design
- `FEATURE_CHECKLIST.md` — build-order checklist, v1 vs v2 scope

## Core Concept
> "Engineering Failure Knowledge Base" — not motivation content, not a forum.
> Pure structured technical learning, delivered through a feed people
> actually want to scroll.

## Goals
1. Strong CV/portfolio piece (recognizable modern stack, public repo)
2. Real usage at ITU and beyond (something people actually open daily)
3. Learning vehicle (Next.js, Postgres, auth, deployment pipeline)

## Non-Goals (v1)
- Not a general social network — no DMs, no random posting, no stories
- Not a forum — no threaded comments in v1
- Not monetized yet — that's v2+ territory

## Tech Stack Summary (all free tier)
- **Frontend:** Next.js + Tailwind CSS
- **Backend/DB:** Supabase (Postgres, Auth, Storage)
- **Hosting:** Vercel
- **Auth:** Google OAuth via Supabase Auth
- **Version control:** GitHub (public repo)

## Build Philosophy
- Small MVP first. Resist scope creep.
- Get the deploy pipeline working in week 1, before any real features.
- Every feature added must map to a line item in FEATURE_CHECKLIST.md.
- Looks matter as much as function — this is a portfolio piece, so the
  feed has to feel good to scroll, not just "function correctly."

## Timeline
~6 weeks at a few hours/week. See FEATURE_CHECKLIST.md for week-by-week
breakdown.
