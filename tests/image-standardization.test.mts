import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
// @ts-expect-error Node's TypeScript test runner intentionally loads the source module directly.
import { composeStandardImages } from "../src/lib/images/standardize.ts";

async function alphaBounds(image: Buffer) {
  const { data, info } = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * info.channels + info.channels - 1] < 8) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

test("standardizes an alpha cutout into centered transparent master and thumbnail", async () => {
  const garment = await sharp({ create: { width: 300, height: 660, channels: 4, background: { r: 44, g: 70, b: 120, alpha: 1 } } }).png().toBuffer();
  const source = await sharp({ create: { width: 1200, height: 1000, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: garment, left: 120, top: 150 }])
    .png()
    .toBuffer();

  const { master, thumbnail } = await composeStandardImages(source);
  const [masterInfo, thumbnailInfo, masterBounds] = await Promise.all([
    sharp(master).metadata(),
    sharp(thumbnail).metadata(),
    alphaBounds(master),
  ]);

  assert.equal(masterInfo.format, "webp");
  assert.equal(masterInfo.width, 1200);
  assert.equal(masterInfo.height, 1200);
  assert.equal(masterInfo.hasAlpha, true);
  assert.equal(thumbnailInfo.format, "webp");
  assert.equal(thumbnailInfo.width, 500);
  assert.equal(thumbnailInfo.height, 500);
  assert.equal(thumbnailInfo.hasAlpha, true);
  assert.ok(masterBounds.width <= 996 && masterBounds.height <= 996, JSON.stringify(masterBounds));
  assert.ok(Math.abs(masterBounds.left + masterBounds.width / 2 - 600) <= 1);
  assert.ok(Math.abs(masterBounds.top + masterBounds.height / 2 - 600) <= 1);
  assert.ok(Math.abs(masterBounds.width / masterBounds.height - 300 / 660) < 0.02);
});

test("keeps the garment and removes a separate foreground object", async () => {
  const garment = await sharp({ create: { width: 280, height: 500, channels: 4, background: { r: 44, g: 70, b: 120, alpha: 1 } } }).png().toBuffer();
  const strayObject = await sharp({ create: { width: 120, height: 150, channels: 4, background: { r: 240, g: 45, b: 45, alpha: 1 } } }).png().toBuffer();
  const source = await sharp({ create: { width: 1000, height: 1000, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: strayObject, left: 70, top: 80 },
      { input: garment, left: 420, top: 300 },
    ])
    .png()
    .toBuffer();

  const { master } = await composeStandardImages(source);
  const { data, info } = await sharp(master).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let strayPixels = 0;
  for (let index = 0; index < info.width * info.height; index++) {
    const offset = index * info.channels;
    if (data[offset] > 180 && data[offset + 1] < 110 && data[offset + 2] < 110 && data[offset + info.channels - 1] > 100) strayPixels++;
  }

  assert.equal(strayPixels, 0);
  const bounds = await alphaBounds(master);
  assert.ok(Math.abs(bounds.width / bounds.height - 280 / 500) < 0.02, JSON.stringify(bounds));
});

test("rejects an image with no meaningful foreground", async () => {
  const empty = await sharp({ create: { width: 400, height: 400, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
  await assert.rejects(composeStandardImages(empty), /No foreground/);
});

test("rejects a photo that still has an opaque background", async () => {
  const opaque = await sharp({ create: { width: 400, height: 400, channels: 4, background: { r: 30, g: 40, b: 50, alpha: 1 } } }).png().toBuffer();
  await assert.rejects(composeStandardImages(opaque), /No transparent background/);
});
