# FailLog — Frontend Spec

## 1. Design Direction
Instagram-style feed mechanics, applied to technical postmortem content
instead of photos. The goal: scrolling FailLog should feel as smooth and
habitual as scrolling IG, while the content stays dense and technical.

**Visual tone:** dark-mode-first, card-based, generous spacing, monospace
accents for technical fields (category, tags) to signal "engineering" not
"social media fluff."

## 2. Layout Structure

### 2.1 Navbar (sticky top, like IG's top bar)
- Logo / wordmark, left
- Search icon → expands to search bar
- "+" button → opens create-post page/modal
- Profile avatar, right → dropdown (My Posts, Logout)

### 2.2 Feed Page (home `/`)
- Single-column, centered, max-width ~600px (mirrors IG's feed column)
- Vertical infinite scroll
- Each post = a **FailureCard**:
  ```
  ┌─────────────────────────────────┐
  │ [avatar] Name · 2h ago          │  ← header row
  │ [Category Badge]                 │
  │ TITLE (bold, larger)             │
  │ Problem snippet (2-3 lines, ...) │
  │ #tag #tag #tag                   │
  │ [optional image, full-width]     │
  │ ─────────────────────────────    │
  │ 🔺 24   "Read full breakdown →"  │  ← footer row: upvote + CTA
  └─────────────────────────────────┘
  ```
- Cards have rounded corners, subtle border, soft shadow on hover
- Upvote icon uses a "triangle up" or "flag" motif rather than a heart —
  reinforces "this is technical, not romantic/social" without losing the
  satisfying tap-to-like interaction feel
- Tap upvote → optimistic fill animation, count increments immediately

### 2.3 Detail Page (`/failure/[id]`)
- Same card header (author, category, title) at top, larger
- Full structured breakdown rendered as labeled sections:
  - **The Problem**
  - **What I Tried**
  - **Why It Failed**
- Tags as chips below
- Upvote button persists at bottom, sticky on mobile (like IG's like bar)
- "Similar failures" section stubbed with a placeholder card row (greyed
  out / "coming soon") — UI slot reserved, no logic in v1

#### 2.3.1 Failure Chain Timeline (v1.5 — only shown if a chain exists)
If this post has a `parent_failure_id` OR has child posts retrying it,
render a vertical timeline above the main content:
```
●━━ Attempt 1: [title]          [outcome dot: red/yellow/green]
│
●━━ Attempt 2: [title]
│
●━━ Attempt 3 (this post): [title]   ← current post highlighted
│
○┄┄ 2 people tried this differently →  (if children exist, show count
                                          + link to branches)
```
- Each node is tappable, navigates to that post's detail page
- Outcome dot color: red (failed) / yellow (partial) / green (resolved) —
  grey/neutral if no outcome was set
- If no chain exists at all (no parent, no children), this section simply
  doesn't render — never show an empty timeline
- On the create-post form, an optional "Link to a previous attempt"
  search field lets the user find and select a parent post

### 2.4 Create Post Page (`/new`)
- Single scrollable form, NOT a multi-step wizard (keeps it fast to post)
- Fields in order: Title → Category (dropdown) → Problem → What I Tried →
  Why It Failed → Tags (chip input, type + enter) → Image (optional, drag
  & drop or tap to upload)
- Live character count on long-text fields
- Sticky "Post" button at bottom, disabled until required fields filled

### 2.5 Login Page (`/login`)
- Minimal, centered card: wordmark, one-line tagline, single
  "Continue with Google" button
- No email/password option in v1

## 3. Component Inventory
| Component | Purpose |
|---|---|
| `Navbar.tsx` | Top nav, search trigger, create button, profile menu |
| `FailureCard.tsx` | Feed card — the core visual unit of the app |
| `CategoryBadge.tsx` | Small colored pill per category (consistent color map) |
| `TagChip.tsx` | Individual tag pill, used in cards, detail, and form |
| `UpvoteButton.tsx` | Triangle/flag icon, optimistic toggle state |
| `SearchBar.tsx` | Expandable search input, debounced query |
| `FilterBar.tsx` | Category filter pills + tag multi-select |
| `PostForm.tsx` | Full create-post form |
| `ImageUpload.tsx` | Drag/drop or tap upload, preview before submit |

## 4. Category Badge Coloring (since categories are now free-text, not fixed)
Categories are user-defined, so we can't hardcode a color per category
name. Instead, derive a consistent color from a small fixed palette by
hashing the category string (e.g. simple string hash mod palette length).
Same category text always maps to the same color, but the app isn't
limited to a preset list of categories.

Suggested palette (cycle through via hash): blue, purple, green, orange,
red, teal, pink, yellow — muted/desaturated versions to match the
dark-mode theme.

Category input in the create-post form should still feel guided, not a
blank void: show existing popular categories as quick-select chips above
the free-text field (pulled dynamically from `SELECT DISTINCT category`),
so users can tap an existing one or type their own new category.

## 5. Responsive Behavior
- Mobile-first: single column always, navbar collapses search into icon
- Desktop: feed column stays centered with max-width, doesn't stretch full
  width (avoids the "empty forum" look)

## 6. Microinteractions (what makes it feel alive)
- Upvote tap: brief scale-bounce on the icon + count
- Card hover (desktop): subtle lift/shadow increase
- Infinite scroll: skeleton-loading cards while fetching next page, not a
  spinner — keeps the IG-scroll feel
- New post submit: redirect to detail page with a brief success toast

## 7. Explicitly Avoid
- No infinite "Stories" bar — content type doesn't fit it
- No DM icon in navbar — no messaging in v1
- No heart icon for upvotes — keep the triangle/flag motif so it reads as
  technical endorsement, not social approval
