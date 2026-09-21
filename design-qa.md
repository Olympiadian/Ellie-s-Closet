# Calendar saved-day preview design QA

- Source visual truth: `C:\Users\elico\AppData\Local\Temp\codex-clipboard-e630c604-a5d4-4144-9ad8-5a59b21b601c.png`
- Implementation screenshot: Codex in-app Browser inline capture for `http://localhost:4318/calendar` (saved-day preview state)
- Viewport: 481 × 1051 CSS pixels, device scale factor 1
- Source pixels: 481 × 1051
- Implementation pixels: 481 × 1051
- Density normalization: none required
- State: September 19th, 2026 with two saved wardrobe items

## Full-view comparison evidence

The populated-day view uses the same two-column item grid, light-gray image tiles, date heading, dimmed calendar backdrop, rounded white bottom sheet, and full-width dark Edit action as the reference. The sheet contracts to the two available items instead of rendering empty slots. The retained close control follows the application's existing dismissible-sheet pattern.

## Focused region comparison evidence

The heading, two-column grid, tile spacing, #f7f7f7 image surfaces, and dark Edit action were readable at 1:1 scale. No separate crop was necessary. Fixture items have no image URLs, so the browser showed the real empty-image state; production wardrobe images use the existing `ItemPhoto` rendering path.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Typography uses the application's existing Inclusive Sans/Manrope system and matches the reference hierarchy.
- Spacing, two-column rhythm, sheet radius, backdrop tone, and action placement match the intended composition.
- Colors use the existing app tokens with the requested #f7f7f7 item surfaces and dark primary action.
- Image handling reuses the real wardrobe image component; no substitute assets were introduced.
- Copy uses the selected date in both the heading and Edit action.

## Interaction verification

- Empty day still opens the existing clothing selector.
- Saving two items and reopening the day shows only those two tiles.
- Edit opens the existing selector with both items still selected.
- Desktop/tablet uses the existing right-side sliding drawer and the same preview design.
- Browser console errors/warnings: none.

## Comparison history

- Initial P2: the two-item mobile preview inherited the picker's full-height panel and blue action button.
- Fix: added a content-sized preview sheet state and a dark full-width Edit action.
- Post-fix evidence: the 481 × 1051 mobile capture shows a bottom-anchored, content-sized sheet with two tiles and a dark Edit action; the 1440 × 1000 capture shows the matching right-side drawer.

## Implementation checklist

- [x] Show preview only for days with saved item/build content.
- [x] Flatten direct items and saved-build items, deduplicate, and cap at six.
- [x] Render no empty slots.
- [x] Preserve the existing empty-day picker.
- [x] Preserve selected items when entering Edit mode.
- [x] Verify mobile and desktop responsive behavior.

final result: passed
