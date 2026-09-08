# Ellie’s Closet operations

## Production

- GitHub: `Olympiadian/Ellie-s-Closet`, branch `main`.
- Vercel project: `elliecloset`; production: https://www.elliecloset.com.
- Supabase project: `baybwfubndynsdetmexm`.
- The additive `20260906000000_household_workflows.sql` migration was applied through the Supabase SQL editor. It creates service-role-only records, atomic rate limits and private photo storage; existing wardrobe tables remain untouched.

## Required server configuration

Set `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `CRON_SECRET`, and `OPENAI_API_KEY` in Vercel, never in Git. Set `NEXT_PUBLIC_SUPABASE_URL` and the public Supabase key as described in `.env.example`. Redeploy after changing variables. Use a newly rotated OpenAI key if an earlier key was shared in chat. Preview deployments need their own configuration to exercise protected features.

## First use

1. Normal wardrobe pages open directly without device pairing. Sign into `/admin` with the configured password for publishing and management.
2. Mobile **New Clothes** accepts ten front/back pairs. Submitted photos remain unpublished until admin review.
3. In admin **Review**, download originals, upload finished PNG/WebP cutouts, edit metadata, optionally request AI suggestions, then publish.
4. Admin **Messages** schedules notes by Arizona calendar date. **Requests** contains support submissions. **Setup** controls stores, location and the optional manual PDF URL.

Published items support favorites, saved items, outfit/collection builds and calendar plans. Mobile remains a companion for uploads, metadata corrections and support.

## Daily Deals

Vercel cron calls `/api/deals` each morning (14:00 UTC, with Hobby scheduling flexibility). Requests require `CRON_SECRET`. At most one successful scan is retained per Arizona day, with bounded retries after failure. Admin can run the same scan manually. Research uses paid OpenAI API calls and links to sources; failures are displayed, not replaced with invented deals.

## Verification

Run `npm run build`, `npm run lint`, and `npm test`. Workflow tests use an isolated in-memory Supabase transport and test-only credentials, never production records or AI credits. They cover authorization, device pairing, upload review/publishing, favorites, builds, calendar, support, message privacy, page routes and logout. `node tests/preview.mjs` starts an optional local visual fixture on port 4318.

Private pages, API responses and signed photos are never cached by the service worker. Only static shell assets and a generic offline page are cached.
