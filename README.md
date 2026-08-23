# The Wall

A private, cross-device visual wardrobe and outfit-composition tool. The iPhone is the capture surface, the wall-mounted Android tablet is the browsing and outfit-building surface, and a computer can expose deeper management controls.

The repository currently contains a polished, responsive product prototype backed by realistic sample data plus the production foundations for Supabase, private image storage, OpenAI image indexing, PWA installation, and Vercel deployment.

## What works now

- Editorial wall-tablet home screen
- Searchable and filterable closet browser
- Individual item detail routes
- Interactive manual outfit builder
- Saved outfit gallery
- Add Item camera/file preview
- Bulk Index and Save Outfit flow surfaces
- Processing and review states
- Lightweight closet hub
- Responsive phone, tablet, and desktop layouts
- PWA manifest, generated app icons, production service worker, and social preview
- Supabase schema with row-level security and private image buckets
- Server-only OpenAI image-indexing helper using image input and structured output
- GitHub Actions verification workflow

The interface uses sample data until Supabase is connected. The camera preview is functional, but the final upload/job pipeline is intentionally not exposed before trusted-device authentication is implemented.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS plus product-specific global styles
- Supabase Postgres, Auth, and private Storage
- OpenAI Responses API for clothing-image indexing
- Vercel hosting
- GitHub Actions for lint, type-check, and build verification

Node.js 22 or newer is required by the current Supabase and OpenAI SDKs.

## Local setup

1. Install Node.js 22.
2. Copy `.env.example` to `.env.local`.
3. Install packages and start the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The dedicated kiosk route is `http://localhost:3000/wall`.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Environment variables

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_VISION_MODEL=
NEXT_PUBLIC_SENTRY_DSN=
```

Only the two `NEXT_PUBLIC_` Supabase values may enter browser code. The service-role and OpenAI keys must remain server-only. Choose an image-capable OpenAI model that supports Structured Outputs and set it through `OPENAI_VISION_MODEL`; this keeps model changes out of source code.

## Supabase setup

1. Create a private Supabase project.
2. Add its URL and publishable key to `.env.local`.
3. Install or invoke the Supabase CLI.
4. Link the local repository and apply the migration:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The migration creates:

- `clothing_items`
- `item_images`
- `outfits`
- `outfit_items`
- `tags`
- `clothing_item_tags`
- `processing_jobs`
- private `wardrobe-originals` and `wardrobe-processed` buckets
- owner-scoped row-level security policies

Image paths must begin with the authenticated owner ID, for example:

```text
USER_ID/items/ITEM_ID/front-original.webp
```

The app should use a persistent trusted-device Supabase session. There should be no routine login interruption, but private wardrobe data must never be made public simply to remove a login screen.

## Capture architecture

```text
iPhone camera
  -> preserve original file
  -> create compressed upload copy
  -> private Supabase Storage
  -> processing_jobs row
  -> server-side OpenAI image indexing
  -> validated structured metadata
  -> optional background removal
  -> Ready or Needs Review
  -> phone and wall tablet update
```

The OpenAI boundary is in `src/lib/ai/index-clothing.ts`. It uses the Responses API with image input and a strict Zod-backed Structured Output. Do not call it directly from a Client Component.

## Routes

```text
/             responsive home
/wall         dedicated kiosk home
/closet       visual wardrobe browser
/closet/[id]  item details
/build        outfit builder
/saved        saved looks
/add          item, bulk, and outfit capture
/hub          lightweight closet information
/review       uncertain and failed jobs
/admin        hidden management surface
```

## Vercel deployment

1. Push this folder to a GitHub repository.
2. In Vercel, import that repository as a Next.js project.
3. Add the production environment variables from `.env.example`.
4. Deploy, then add the Vercel production URL to Supabase Auth redirect URLs.
5. Confirm `/wall`, `/manifest.webmanifest`, `/icon`, and a dynamic closet item route load correctly.

Every push to `main` can deploy automatically after GitHub Actions verifies the project.

## Wall tablet setup

- Install Fully Kiosk Browser on the Samsung Galaxy Tab A9+.
- Set its startup URL to `https://YOUR_DOMAIN/wall`.
- Enable full-screen kiosk mode, startup launch, keep-awake behavior, and a PIN to exit.
- Keep the tablet on permanent power with a right-angle USB-C cable.

## Next implementation slice

1. Add one-time trusted-device authentication and the Supabase session proxy.
2. Replace sample closet reads with owner-scoped database queries.
3. Connect Add Item to compression, private upload, and `processing_jobs` creation.
4. Run indexing asynchronously and write validated results back to the item.
5. Add signed image delivery and the review editing form.
6. Add backup/export before mounting the production tablet.

See [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) for the product boundaries and [docs/ROADMAP.md](docs/ROADMAP.md) for the implementation order.

For account links, required secrets, generated icon routes, Vercel import, and tablet setup, use [docs/SETUP_CHECKLIST.md](docs/SETUP_CHECKLIST.md).
