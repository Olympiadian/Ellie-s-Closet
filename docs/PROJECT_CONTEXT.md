# Project Context

## Purpose

The Wall is a private wardrobe interface built as a personal gift. It turns a physical closet into a calm, visual, searchable system where she can browse what she owns, begin with one piece, build a complete outfit, and save combinations that work.

This is not an inventory product, fashion social network, or realistic virtual try-on. It should feel like a private wardrobe gallery. AI remains mostly invisible: it handles naming, categories, colors, seasons, materials, tags, and confidence while she remains responsible for taste and outfit decisions.

## Device roles

- **iPhone PWA:** capture new clothing, bulk-index the initial closet, save real outfit photos, and make quick corrections.
- **Wall tablet:** browse the closet, build outfits, view saved looks, and open the closet hub. Use an 11-inch Samsung Galaxy Tab A9+ in Fully Kiosk Browser at `/wall`.
- **Computer:** review uncertain results, manage data, troubleshoot jobs, and export or restore the wardrobe.

One responsive Next.js app and one Supabase database serve all three.

## Product loop

```text
Browse one piece -> build around it -> save the outfit -> retrieve the physical clothes
```

The capture loop is:

```text
Take photo -> upload -> AI index -> review only if uncertain -> appears everywhere
```

## Primary pages

- **Home/Wall:** Browse, Build, Saved, and Add, plus at most one useful wardrobe prompt.
- **Closet:** visual grid, free scrolling, search, and filters for category, color, season, use, favorite, and recently added.
- **Item detail:** original/processed images, metadata, tags, outfits containing the item, favorite, edit, and archive.
- **Builder:** start with an item, add pieces by slot, replace/remove them, and save a fixed set.
- **Saved:** outfit sets, favorites, recent looks, and flexible occasion groups.
- **Add:** Add Item, Bulk Index, and Save Outfit.
- **Hub:** total pieces, category balance, colors, recent items, and pieces not used in a saved look.
- **Review/Admin:** failed jobs, uncertain classifications, corrections, retry, archive, delete, and export.

## Capture flows

For the initial index, photograph individual pieces using one clear front image and only add back/detail images when useful. Capture must stay fast: take photo, tap Next, continue. All organization happens in the background.

For ongoing additions, open Add Item inside the iPhone PWA, take a photo, confirm, and leave. For outfit photos, support both a real worn photo and a laid-out look; preserve the complete photo while matching its individual pieces against the index.

Every upload remains visible as Uploading, Processing, Ready, Needs Review, or Failed. Work never disappears. Background removal creates a derivative and never overwrites the original.

## MVP boundary

The MVP is complete when it can add and index clothing, browse/filter/search, show item details, build and save outfits, preserve optional outfit photos, correct uncertain AI results, export the wardrobe, and run cleanly on the iPhone and wall tablet.

Weather, automatic recommendations, outfit variations, wear history, packing lists, calendar planning, shopping integrations, advanced statistics, and realistic body mockups are later features.

## Design direction

Personal, premium, calm, and editorial. Use serif typography for large expressive headings and restrained sans-serif typography for controls and metadata. Favor neutral atmospheric backgrounds, clean clothing cutouts, generous spacing, large touch targets, and minimal management clutter. Bottom navigation owns primary navigation; glass effects and decorative elements should remain subordinate to the wardrobe itself.

## Data and privacy

Core records are clothing items, item images, outfits, outfit-item relationships, tags, and processing jobs. Originals and derivatives live in separate private storage paths. All tables and objects are scoped to one authenticated owner through row-level security. Normal devices should retain their trusted session so the app opens immediately without making private images public.
