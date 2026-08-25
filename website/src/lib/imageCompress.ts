// Client-side image compression for KYC document uploads.
// Resizes to max 1400px edge and re-encodes as JPEG, which also strips
// ALL EXIF metadata (including GPS location from phone photos).
// Target: ~150KB per document instead of 3-6MB originals.

const MAX_EDGE = 1400;
const INITIAL_QUALITY = 0.72;
const MIN_QUALITY = 0.45;
const TARGET_BYTES = 180 * 1024;

export async function compressImage(file: File | Blob): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are accepted");
  }

  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(bitmapUrl);

    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported on this device");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    let quality = INITIAL_QUALITY;
    let blob = await toJpeg(canvas, quality);
    while (blob.size > TARGET_BYTES && quality > MIN_QUALITY) {
      quality -= 0.12;
      blob = await toJpeg(canvas, Math.max(MIN_QUALITY, quality));
    }
    return blob;
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = url;
  });
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b && b.size > 0) resolve(b);
        else reject(new Error("Image compression failed"));
      },
      "image/jpeg",
      quality
    );
  });
}
