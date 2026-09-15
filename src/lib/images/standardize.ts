import sharp from "sharp";

const masterSize = 1200;
const thumbnailSize = 500;
const garmentLimit = 0.83;
const alphaThreshold = 8;
const analysisLimit = 768;

export type ForegroundBounds = { left: number; top: number; width: number; height: number; pixels: number };
export type StandardizedImages = { master: Buffer; thumbnail: Buffer };

type RawForegroundBounds = ForegroundBounds;

function cropBounds(bounds: RawForegroundBounds, width: number, height: number): ForegroundBounds {
  const margin = Math.min(48, Math.max(12, Math.ceil(Math.max(bounds.width, bounds.height) * 0.03)));
  const cropLeft = Math.max(0, bounds.left - margin);
  const cropTop = Math.max(0, bounds.top - margin);
  const cropRight = Math.min(width, bounds.left + bounds.width + margin);
  const cropBottom = Math.min(height, bounds.top + bounds.height + margin);
  return { left: cropLeft, top: cropTop, width: cropRight - cropLeft, height: cropBottom - cropTop, pixels: bounds.pixels };
}

function validateForeground(bounds: RawForegroundBounds, width: number, height: number) {
  const minPixels = Math.max(256, Math.ceil(width * height * 0.0005));
  if (bounds.pixels < minPixels || bounds.width < Math.max(8, Math.floor(width * 0.015)) || bounds.height < Math.max(8, Math.floor(height * 0.015))) {
    throw new Error("The detected clothing area is too small to standardize.");
  }
}

function allForegroundBounds(pixels: Buffer, width: number, height: number, channels: number): RawForegroundBounds {
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
  return { left, top, width: right - left + 1, height: bottom - top + 1, pixels: count };
}

/** Finds the largest connected foreground subject, ignoring separate objects the model also retained. */
export function detectDominantForegroundBounds(pixels: Buffer, width: number, height: number, channels: number): ForegroundBounds {
  const alphaOffset = channels - 1;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let dominant: RawForegroundBounds | undefined;

  for (let start = 0; start < width * height; start++) {
    if (visited[start] || pixels[start * channels + alphaOffset] < alphaThreshold) continue;

    let head = 0;
    let tail = 0;
    let left = width;
    let top = height;
    let right = -1;
    let bottom = -1;
    visited[start] = 1;
    queue[tail++] = start;

    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = Math.floor(index / width);
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);

      const visit = (neighbor: number) => {
        if (visited[neighbor] || pixels[neighbor * channels + alphaOffset] < alphaThreshold) return;
        visited[neighbor] = 1;
        queue[tail++] = neighbor;
      };
      if (x > 0) visit(index - 1);
      if (x + 1 < width) visit(index + 1);
      if (y > 0) visit(index - width);
      if (y + 1 < height) visit(index + width);
    }

    const component = { left, top, width: right - left + 1, height: bottom - top + 1, pixels: tail };
    if (!dominant || component.pixels > dominant.pixels) dominant = component;
  }

  if (!dominant) throw new Error("No foreground was found in the background-removed photo.");
  validateForeground(dominant, width, height);
  return dominant;
}

export function detectForegroundBounds(pixels: Buffer, width: number, height: number, channels: number): ForegroundBounds {
  const bounds = allForegroundBounds(pixels, width, height, channels);
  validateForeground(bounds, width, height);
  return cropBounds(bounds, width, height);
}

function scaleBounds(bounds: ForegroundBounds, sourceWidth: number, sourceHeight: number, analysisWidth: number, analysisHeight: number): ForegroundBounds {
  const left = Math.max(0, Math.floor(bounds.left * sourceWidth / analysisWidth));
  const top = Math.max(0, Math.floor(bounds.top * sourceHeight / analysisHeight));
  const right = Math.min(sourceWidth, Math.ceil((bounds.left + bounds.width) * sourceWidth / analysisWidth));
  const bottom = Math.min(sourceHeight, Math.ceil((bounds.top + bounds.height) * sourceHeight / analysisHeight));
  return { left, top, width: right - left, height: bottom - top, pixels: bounds.pixels };
}

/** Crops alpha excess, preserves aspect ratio, and centers one garment on transparent canvases. */
export async function composeStandardImages(source: Buffer): Promise<StandardizedImages> {
  const { data, info } = await sharp(source, { failOn: "warning" })
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (!info.width || !info.height) throw new Error("The background-removed photo is invalid.");

  const allBounds = detectForegroundBounds(data, info.width, info.height, info.channels);
  if (allBounds.pixels >= info.width * info.height * 0.99) {
    throw new Error("No transparent background was found in the processed photo.");
  }
  const analysis = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .resize({ width: analysisLimit, height: analysisLimit, fit: "inside", kernel: sharp.kernel.nearest })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const analyzedBounds = detectDominantForegroundBounds(analysis.data, analysis.info.width, analysis.info.height, analysis.info.channels);
  const bounds = cropBounds(
    scaleBounds(analyzedBounds, info.width, info.height, analysis.info.width, analysis.info.height),
    info.width,
    info.height,
  );
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
