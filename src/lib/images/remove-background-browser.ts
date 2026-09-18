/**
 * Browser-only image cleanup. The model is fetched and cached by the browser;
 * source photos never pass through a third-party background-removal API.
 */
export type BackgroundRemovalProgress = {
  stage: "loading-model" | "downloading-model" | "removing-background";
  percent?: number;
};

type BrowserSegmenter = (image: Blob) => Promise<{
  width: number;
  height: number;
  resize: (width: number, height: number) => Promise<unknown>;
  toBlob: (type?: string, quality?: number) => Promise<Blob>;
}>;

const modelId = "onnx-community/ormbg-ONNX";
const maxCutoutDimension = 2000;
const maxInferenceDimension = 1280;
let segmenterPromise: Promise<BrowserSegmenter> | undefined;

function reportDownload(
  update: { status?: string; progress?: number },
  onProgress?: (progress: BackgroundRemovalProgress) => void,
) {
  if (update.status === "progress") {
    onProgress?.({ stage: "downloading-model", percent: Math.round(update.progress ?? 0) });
  } else if (update.status === "initiate" || update.status === "download") {
    onProgress?.({ stage: "downloading-model" });
  }
}

async function getSegmenter(onProgress?: (progress: BackgroundRemovalProgress) => void) {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      onProgress?.({ stage: "loading-model" });
      // This import is deliberately deferred until a client starts an upload.
      // It must not enter the server bundle or the initial page payload.
      const { pipeline } = await import("@huggingface/transformers");
      const segmenter = await pipeline("background-removal", modelId, {
        device: "wasm",
        dtype: "q4",
        progress_callback: (update) => reportDownload(update, onProgress),
      });
      return segmenter as unknown as BrowserSegmenter;
    })();
    segmenterPromise.catch(() => { segmenterPromise = undefined; });
  }
  return segmenterPromise;
}

async function resizeForInference(source: File) {
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, maxInferenceDimension / Math.max(bitmap.width, bitmap.height));
  if (scale === 1) {
    bitmap.close();
    return source;
  }

  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("This browser cannot prepare the photo for background removal.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
}

/** Produces a compact transparent PNG suitable for the private processed upload. */
export async function removeBackgroundInBrowser(
  source: File,
  onProgress?: (progress: BackgroundRemovalProgress) => void,
) {
  if (typeof window === "undefined" || !window.OffscreenCanvas || !window.createImageBitmap) {
    throw new Error("This browser cannot remove the photo background. Please update the browser and try again.");
  }

  const segmenter = await getSegmenter(onProgress);
  onProgress?.({ stage: "removing-background" });
  // Phone cameras can produce 12–48MP originals. Passing those directly to
  // the WASM model can exhaust Safari's memory and reload the app mid-upload.
  const cutout = await segmenter(await resizeForInference(source));
  const scale = Math.min(1, maxCutoutDimension / Math.max(cutout.width, cutout.height));
  if (scale < 1) {
    await cutout.resize(Math.max(1, Math.round(cutout.width * scale)), Math.max(1, Math.round(cutout.height * scale)));
  }

  const png = await cutout.toBlob("image/png");
  if (!png.size) throw new Error("The background-removed photo was empty. Please choose another photo.");
  const filename = (source.name.replace(/\.[^.]+$/, "") || "clothing") + "-cutout.png";
  return new File([png], filename, { type: "image/png" });
}
