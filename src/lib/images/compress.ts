type CompressOptions = {
  maxDimension?: number;
  quality?: number;
  mimeType?: "image/webp";
};

export async function compressImage(
  file: File,
  {
    maxDimension = 1600,
    quality = 0.8,
    mimeType = "image/webp",
  }: CompressOptions = {},
): Promise<File> {
  // createImageBitmap applies the photo's EXIF orientation before it reaches the canvas.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
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

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image compression failed."))),
      mimeType,
      quality,
    );
  });
  const stem = file.name.replace(/\.[^.]+$/, "") || "clothing-photo";
  return new File([blob], `${stem}.webp`, { type: mimeType, lastModified: file.lastModified });
}
