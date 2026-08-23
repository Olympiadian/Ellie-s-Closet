# Implementation Roadmap

## Phase 1 — Product prototype

- [x] Responsive phone and wall-tablet shell
- [x] Closet browsing and filtering with representative data
- [x] Item details
- [x] Manual outfit builder
- [x] Saved looks
- [x] Capture and processing-state surfaces
- [x] Closet hub and hidden management routes
- [x] PWA foundation

## Phase 2 — Private data

- [x] Versioned initial database migration
- [x] Private storage buckets and owner-scoped policies
- [x] Browser, server, and admin Supabase clients
- [ ] Create the Supabase project and apply the migration
- [ ] Add one-time trusted-device authentication
- [ ] Add the session-refresh proxy and protect data routes
- [ ] Replace sample reads with database queries

## Phase 3 — Capture pipeline

- [x] Browser image-compression utility
- [x] Server-only AI indexing helper with structured validation
- [ ] Preserve the original and upload a compressed derivative
- [ ] Create visible processing jobs
- [ ] Run indexing outside the request lifecycle
- [ ] Write results and confidence back to the item
- [ ] Generate a thumbnail and background-removed image
- [ ] Add retry and complete review editing

## Phase 4 — Outfit persistence

- [ ] Save builder selections to `outfits` and `outfit_items`
- [ ] Attach worn or laid-out outfit photographs
- [ ] Match items found in complete outfit photos
- [ ] Let unmatched pieces become new clothing items

## Phase 5 — Release

- [ ] Full structured-data and image export
- [ ] Error reporting
- [ ] Minimal internal product events
- [ ] Install on iPhone as a PWA
- [ ] Configure Fully Kiosk Browser at `/wall`
- [ ] Test offline fallback, failed uploads, retry, and app updates
- [ ] Mount and power the tablet

Do not add weather, recommendation engines, wear logging, packing tools, or advanced analytics until the capture and outfit loops are reliable.
