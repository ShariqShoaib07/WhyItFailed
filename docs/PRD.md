# FailLog — Product Requirements Document (PRD)

## 1. Problem Statement
Students fail constantly while building projects (robotics, code, hardware),
but that knowledge dies in private group chats or gets forgotten entirely.
There's no structured place to browse "what went wrong and why" before
attempting something similar.

## 2. Target Users
- **Primary:** University engineering/CS students (ITU and beyond) working
  on personal or course projects (robotics, ML, embedded, apps).
- **Secondary:** Course instructors / project supervisors who want to see
  common failure patterns across student work.

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
Fields: title, category (enum dropdown), problem description, what was
tried, why it failed, tags (multi-input), optional image upload.
All fields except image and tags are required.

### 4.3 Feed
- Reverse chronological by default
- Card per post: title, category badge, short problem snippet, tag chips,
  upvote count, author name, relative timestamp
- Infinite scroll (paginated fetch, not "load more" button)

### 4.4 Search & Filter
- Text search across title + problem description
- Filter by category (single select)
- Filter by tag (multi-select)

### 4.5 Detail Page
- Full content of all fields
- Upvote button
- Author + timestamp
- "Similar failures" — deferred to v2 (stub the UI slot, don't build logic)

### 4.6 Upvotes
- One upvote per user per post, toggleable (click again to remove)
- Optimistic UI update on click

## 5. Out of Scope for v1
- Comments/replies
- Notifications
- Direct messages
- Admin moderation dashboard
- "Similar failures" recommendation logic
- Email digests
- Multi-university tenancy

## 6. Success Metrics
- **Portfolio metric:** Clean, deployed, public repo with README + live link
- **Usage metric:** 50 real posted failures within first semester of launch
- **Engagement metric:** Average session includes scrolling 10+ feed cards

## 7. Open Questions (revisit later)
- Should categories be a fixed enum or user-extendable tags only?
  → v1 decision: fixed enum (Robotics, AI/ML, Web/App, Embedded, Hardware,
    Other) + free-form tags for finer detail.
- Anonymous posting option? → Not in v1, revisit if users request it.
