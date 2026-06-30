# FailLog — Product Requirements Document (PRD)

## 1. Problem Statement
People fail constantly while building things — projects, experiments,
businesses, code, research, art — but that knowledge dies in private group
chats or gets forgotten entirely. There's no structured place to browse
"what went wrong and why" before attempting something similar, regardless
of what field you're in.

## 2. Target Users
- **Primary:** Students and self-learners across any discipline (not just
  engineering/CS) working on personal or course projects — robotics, ML,
  embedded, apps, but also business plans, lab experiments, design work,
  writing, or any structured attempt that can fail in an instructive way.
- **Secondary:** Instructors / mentors / project supervisors across any
  field who want to see common failure patterns across a community's work.

FailLog is domain-agnostic by design. The schema and UI never assume a
specific field — categories are user-defined, not engineering-specific.

## 3. User Stories (v1)

| # | As a... | I want to... | So that... |
|---|---------|---------------|------------|
| 1 | Student | Sign in with Google | I don't need a new password |
| 2 | Student | Post a failure report with structured fields | Others can learn from it quickly |
| 3 | Student | Scroll a feed of failures | I discover relevant content passively |
| 4 | Student | Search/filter by category or tag | I find failures relevant to my project |
| 5 | Student | Open a failure's detail page | I read the full breakdown |
| 6 | Student | Upvote a useful failure post | I signal value to others, post gets surfaced |
| 7 | Student | See my own past posts | I can track/edit my contributions |

## 4. Functional Requirements (v1 scope)

### 4.1 Auth
- Google sign-in only (no email/password in v1)
- New user → auto-create a `profiles` row

### 4.2 Create Post
Fields: title, category (free-text input, user-defined — not a fixed
dropdown), problem description, what was tried, why it failed, tags
(multi-input), optional image upload. All fields except image and tags
are required. Category value is normalized (trimmed + lowercased) on save
so filtering stays consistent even though input is free-text.

### 4.3 Feed
- Reverse chronological by default
- Card per post: title, category badge, short problem snippet, tag chips,
  upvote count, author name, relative timestamp
- Infinite scroll (paginated fetch, not "load more" button)

### 4.4 Search & Filter
- Text search across title + problem description
- Filter by category — options populated dynamically from categories that
  actually exist in posted data, not a hardcoded list
- Filter by tag (multi-select)

### 4.5 Detail Page
- Full content of all fields
- Upvote button
- Author + timestamp
- "Similar failures" — deferred to v2 (stub the UI slot, don't build logic)

### 4.6 Upvotes
- One upvote per user per post, toggleable (click again to remove)
- Optimistic UI update on click

### 4.7 Failure Chains (v1.5 — the app's signature differentiator)
This is FailLog's unique mechanic, what separates it from a generic
"post your failure" board. Most failure/postmortem content shows isolated
incidents. Real engineering/problem-solving is iterative — people retry,
adjust, and eventually succeed or abandon. Failure Chains makes that
visible.

**Behavior:**
- When creating a post, an optional field: "Is this a retry of an earlier
  attempt?" — user searches/selects a previous post (their own or anyone's)
  to link as the parent.
- A post can have at most one parent (the attempt it followed), but can
  have multiple children (multiple people may have retried the same
  failure differently) — this forms a tree, not just a flat list.
- Detail page renders the full chain as a vertical timeline: each linked
  attempt shown in order, with its own title/category/outcome, ending at
  the current post.
- Optional "outcome" tag per post in a chain: Failed / Partially Worked /
  Resolved — gives the chain visual progress (e.g. red → yellow → green
  dots in the timeline).
- Chains are entirely optional. A standalone post with no parent/children
  is still fully valid — this feature must never feel mandatory or block
  posting.

**Why this matters for positioning:** it reframes FailLog from "a feed of
individual failures" to "a visible map of how people actually iterate
toward working solutions" — the thing competitors don't show.

## 5. Out of Scope for v1
- Comments/replies
- Notifications
- Direct messages
- Admin moderation dashboard
- "Similar failures" recommendation logic
- Email digests
- Multi-university tenancy
- Echo / "this happened to me too" reaction (separate from upvotes) —
  deferred to v2 backlog, see FEATURE_CHECKLIST.md

## 6. Success Metrics
- **Portfolio metric:** Clean, deployed, public repo with README + live link
- **Usage metric:** 50 real posted failures within first semester of launch
- **Engagement metric:** Average session includes scrolling 10+ feed cards
- **Differentiator metric:** at least a few real Failure Chains (2+ linked
  posts) exist, demonstrating the feature in action for demo/CV purposes

## 7. Open Questions (revisit later)
- Should categories be a fixed enum or user-extendable tags only?
  → **Decision (updated):** free-text category field, normalized
    (trim + lowercase) on save. No fixed enum — keeps the app
    domain-agnostic so it isn't locked to engineering/CS use cases.
    Filter options are derived dynamically from existing data.
- Anonymous posting option? → Not in v1, revisit if users request it.
