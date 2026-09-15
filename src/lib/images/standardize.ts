import sharp from "sharp";

const masterSize = 1200;
const thumbnailSize = 500;
const garmentLimit = 0.83;
const alphaThreshold = 8;

export type ForegroundBounds = { left: number; top: number; width: number; height: number; pixels: number };
export type StandardizedImages = { master: Buffer; thumbnail: Buffer };

export function detectForegroundBounds(pixels: Buffer, width: number, height: number, channels: number): ForegroundBounds {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  let count = 0;
  const alphaOffset = channels - 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * channels + alphaOffset] < alphaThreshold) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
      count++;
    }
  }

  if (right < left || bottom < top) throw new Error("No foreground was found in the background-removed photo.");
  const foregroundWidth = right - left + 1;
  const foregroundHeight = bottom - top + 1;
  const minPixels = Math.max(256, Math.ceil(width * height * 0.0005));
  if (count < minPixels || foregroundWidth < Math.max(8, Math.floor(width * 0.015)) || foregroundHeight < Math.max(8, Math.floor(height * 0.015))) {
    throw new Error("The detected clothing area is too small to standardize.");
  }

  const margin = Math.min(48, Math.max(12, Math.ceil(Math.max(foregroundWidth, foregroundHeight) * 0.03)));
  const cropLeft = Math.max(0, left - margin);
  const cropTop = Math.max(0, top - margin);
  const cropRight = Math.min(width, right + margin + 1);
  const cropBottom = Math.min(height, bottom + margin + 1);
  return { left: cropLeft, top: cropTop, width: cropRight - cropLeft, height: cropBottom - cropTop, pixels: count };
}

/** Crops alpha excess, preserves aspect ratio, and centers one garment on transparent canvases. */
export async function composeStandardImages(source: Buffer): Promise<StandardizedImages> {
  const { data, info } = await sharp(source, { failOn: "warning" })
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (!info.width || !info.height) throw new Error("The background-removed photo is invalid.");

  const bounds = detectForegroundBounds(data, info.width, info.height, info.channels);
  if (bounds.pixels >= info.width * info.height * 0.99) {
    throw new Error("No transparent background was found in the processed photo.");
  }
  const cropped = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .extract({ left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const contained = await sharp(cropped.data, { raw: { width: cropped.info.width, height: cropped.info.height, channels: cropped.info.channels } })
    .resize({ width: Math.round(masterSize * garmentLimit), height: Math.round(masterSize * garmentLimit), fit: "inside", kernel: sharp.kernel.lanczos3 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const left = Math.floor((masterSize - contained.info.width) / 2);
  const top = Math.floor((masterSize - contained.info.height) / 2);
  const master = await sharp(contained.data, { raw: { width: contained.info.width, height: contained.info.height, channels: contained.info.channels } })
    .extend({
      top,
      bottom: masterSize - contained.info.height - top,
      left,
      right: masterSize - contained.info.width - left,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 85, alphaQuality: 100, effort: 4 })
    .toBuffer();
  const thumbnail = await sharp(master)
    .resize({ width: thumbnailSize, height: thumbnailSize, fit: "fill" })
    .webp({ quality: 85, alphaQuality: 100, effort: 4 })
    .toBuffer();
  return { master, thumbnail };
}
