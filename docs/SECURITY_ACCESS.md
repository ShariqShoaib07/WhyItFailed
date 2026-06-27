# FailLog — Security & Access Control

## 1. Auth Model
- Google OAuth only, handled entirely by Supabase Auth (no custom password
  storage, no custom session handling).
- On first sign-in, a `profiles` row is created automatically via a
  Postgres trigger on `auth.users` insert.

## 2. Row Level Security (RLS) — Required on Every Table
Supabase Postgres tables are **not** secure by default once RLS is enabled
unless policies are explicitly written. Enable RLS on all three tables and
apply the policies below before any public deployment.

### `profiles`
- **SELECT:** public (anyone can view a profile's public fields)
- **INSERT:** only via trigger on signup, not directly from client
- **UPDATE:** only the row owner (`auth.uid() = id`)
- **DELETE:** disabled at app level for v1

### `failures`
- **SELECT:** public (anyone, even logged-out, can read the feed)
- **INSERT:** only authenticated users, and `user_id` must equal `auth.uid()`
- **UPDATE:** only the post owner (`auth.uid() = user_id`)
- **DELETE:** only the post owner

### `upvotes`
- **SELECT:** public (needed to compute/display counts)
- **INSERT:** only authenticated users, and `user_id` must equal `auth.uid()`
- **DELETE:** only the row owner (so users can un-upvote their own vote)
- **UNIQUE constraint** on `(failure_id, user_id)` prevents duplicate votes
  even if a client tries to bypass UI restrictions

## 3. Storage Bucket (`failure-images`)
- **Read:** public
- **Write:** authenticated users only
- **Delete:** only the uploader (match on file path prefix containing
  their user id)
- File size limit enforced client-side before upload (e.g., max 5MB) to
  avoid abuse of free storage tier

## 4. Client-Side vs Server-Side Trust
- The anon key is public by design — it is safe to expose in the browser
  bundle because **RLS is what actually protects data**, not key secrecy.
- Never expose the Supabase **service role key** in any client-side code,
  environment variable prefixed with `NEXT_PUBLIC_`, or committed file.
  It bypasses RLS entirely and must only ever be used in a secure
  server-only context (not needed for v1 at all).

## 5. Input Validation
- All form fields validated client-side (required fields, max lengths)
  AND re-validated via Postgres column constraints (`NOT NULL`, length
  checks) so a malicious direct API call can't bypass UI validation.
- Sanitize any user-submitted text before rendering if ever using
  `dangerouslySetInnerHTML` (avoid this entirely in v1 — render as plain
  text, no rich text/HTML posts).

## 6. Rate Limiting / Abuse Prevention (v1-lightweight)
- Rely on Supabase's built-in connection/request limits on the free tier
  for now.
- If spam becomes an issue: add a simple "max N posts per user per day"
  check in the insert policy or a Postgres function. Not built in v1
  unless abuse is observed.

## 7. Secrets Checklist Before Going Public
- [ ] `.env.local` is in `.gitignore`
- [ ] No service role key anywhere in the repo
- [ ] RLS enabled on all three tables (Supabase disables this by default
      being "off" only matters if you forget to turn it on — verify in
      dashboard before launch)
- [ ] Google OAuth redirect URLs configured for both local dev and the
      production Vercel domain
