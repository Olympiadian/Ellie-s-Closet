type CompressOptions = {
  maxDimension?: number;
  quality?: number;
  mimeType?: "image/jpeg" | "image/webp";
};

export async function compressImage(
  file: File,
  {
    maxDimension = 1800,
    quality = 0.82,
    mimeType = "image/webp",
  }: CompressOptions = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Image compression is unavailable in this browser.");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image compression failed."))),
      mimeType,
      quality,
    );
  });
}
