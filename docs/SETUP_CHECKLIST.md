# Launch Checklist

This file lists the accounts, links, values, and physical setup needed to turn the repository into the private production closet app.

## 1. GitHub

- Target repository: `Olympiadian/ellie-s-closet`
- Repository URL: <https://github.com/Olympiadian/ellie-s-closet>
- Give the connected GitHub app read/write access to this repository.
- Keep the default branch named `main`.
- Never commit `.env.local`, API keys, passwords, or service-role keys.

## 2. Supabase

Create a project at <https://supabase.com/dashboard/new>, then collect these values from **Project Settings → API**:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service-role key is server-only. Do not place it in browser code or commit it to GitHub.

Link the project and apply the included database migration:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The migration creates the wardrobe tables, owner-only security policies, and private image-storage buckets.

## 3. OpenAI

Create a server-side API key at <https://platform.openai.com/api-keys> and set:

```text
OPENAI_API_KEY=
OPENAI_VISION_MODEL=
```

Choose an image-capable model that supports Structured Outputs. The key must remain server-only.

## 4. Vercel

After the GitHub repository contains the app, import it at:

<https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOlympiadian%2Fellie-s-closet>

Use the repository root as the project root and add every value from `.env.example`. Set:

```text
NEXT_PUBLIC_SITE_URL=https://YOUR_PRODUCTION_DOMAIN
```

After deployment, add the production URL to the Supabase Auth site URL and redirect allow-list. Each push to `main` can then deploy automatically.

## 5. App icons and browser assets

The repository generates the branded assets automatically:

- `/favicon.svg` — scalable browser favicon
- `/icon` — 512 × 512 browser and PWA icon
- `/apple-icon` — 180 × 180 Apple home-screen icon
- `/maskable-icon.svg` — full-bleed Android PWA icon
- `/manifest.webmanifest` — installable-app metadata
- `/opengraph-image` — 1200 × 630 social preview
- `/sw.js` — production service worker

No separate icon upload is required for the web app. Replace the lettermark in `src/app/icon.tsx` and `src/app/apple-icon.tsx` later if a final logo is created.

## 6. Information and materials still needed

- Supabase project URL and publishable key
- Supabase service-role key, stored only in Vercel and local `.env.local`
- OpenAI API key and selected vision model, stored only in Vercel and local `.env.local`
- Final production domain, if using a custom domain
- Confirmation of the final app name and lettermark
- Real clothing photos for testing the indexing flow
- One trusted owner account for private access

Do not paste secrets into issues, pull requests, documentation, or chat messages. Add them directly to the Supabase/Vercel dashboards and local `.env.local`.

## 7. Wall tablet

- Samsung Galaxy Tab A9+ or equivalent wall-mounted Android tablet
- Permanent power and a right-angle USB-C cable
- Fully Kiosk Browser
- Startup URL: `https://YOUR_PRODUCTION_DOMAIN/wall`
- Full-screen mode, launch on boot, keep-awake, and a PIN-protected exit

## 8. Final verification

Confirm these routes load after deployment:

```text
/
/wall
/closet
/build
/add
/manifest.webmanifest
/icon
/apple-icon
/opengraph-image
```

Then test one owner login, one private image upload, one indexing job, and one saved outfit on both the phone and wall tablet.
