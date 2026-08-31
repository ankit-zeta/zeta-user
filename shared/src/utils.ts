export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(timestamp: number | string | Date): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(timestamp: number | string | Date): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function generateReferralCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) || "ZETA";
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}${random}`;
}

export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ZG-${year}-${random}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// ── Image Upload Validation ─────────────────────────────────────────────────
// Allowed image MIME types for uploads (QR codes, chat attachments, avatars)
const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

// Max file sizes per context
const MAX_QR_FILE_SIZE = 5 * 1024 * 1024; // 5MB for QR codes
const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024; // 10MB for chat attachments
const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024; // 2MB for avatars

export type UploadContext = "qr" | "chat" | "avatar";

// ── Magic Bytes (File Signature) Validation ─────────────────────────────────
// These are the first bytes of a file that identify the actual file format.
// This prevents attackers from renaming malicious files (e.g., .exe → .jpg).
const IMAGE_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [
    [0xff, 0xd8, 0xff], // JPEG: FF D8 FF
  ],
  "image/png": [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG: 89 50 4E 47 0D 0A 1A 0A
  ],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  "image/webp": [
    [0x52, 0x49, 0x46, 0x46], // RIFF (first 4 bytes, followed by file size and WEBP)
  ],
  "image/bmp": [
    [0x42, 0x4d], // BM
  ],
  "image/tiff": [
    [0x49, 0x49, 0x2a, 0x00], // II (little-endian)
    [0x4d, 0x4d, 0x00, 0x2a], // MM (big-endian)
  ],
};

/**
 * Validate file content by checking magic bytes (file signatures).
 * This detects disguised files where an attacker renames a non-image file
 * to have an image extension (e.g., .exe renamed to .jpg).
 *
 * @param fileBytes - The first 8+ bytes of the file
 * @param claimedMimeType - The claimed MIME type from the client
 * @returns { valid: true } or { valid: false, error: string }
 */
export function validateFileMagicBytes(
  fileBytes: Uint8Array,
  claimedMimeType: string
): { valid: true } | { valid: false; error: string } {
  // SVG files are XML-based — validate they don't contain script tags
  if (claimedMimeType === "image/svg+xml") {
    const content = new TextDecoder().decode(fileBytes);
    const lowerContent = content.toLowerCase();
    // Block SVGs with embedded scripts, iframes, or event handlers
    if (
      lowerContent.includes("<script") ||
      lowerContent.includes("javascript:") ||
      lowerContent.includes("onerror=") ||
      lowerContent.includes("onload=") ||
      lowerContent.includes("<iframe") ||
      lowerContent.includes("<object") ||
      lowerContent.includes("<embed")
    ) {
      return {
        valid: false,
        error: "SVG file contains potentially malicious content (scripts/event handlers). Only static SVG images are allowed.",
      };
    }
    return { valid: true };
  }

  // For raster images, check magic bytes
  const signatures = IMAGE_SIGNATURES[claimedMimeType];
  if (!signatures) {
    return {
      valid: false,
      error: `Unsupported image type: ${claimedMimeType}`,
    };
  }

  // Check if file starts with any of the expected signatures
  const matches = signatures.some((sig) => {
    if (fileBytes.length < sig.length) return false;
    return sig.every((byte, index) => fileBytes[index] === byte);
  });

  if (!matches) {
    return {
      valid: false,
      error: `File content does not match claimed type "${claimedMimeType}". The file may be disguised — only genuine image files are allowed.`,
    };
  }

  return { valid: true };
}

/**
 * Validate that a file is an image based on its MIME type and size.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateImageUpload(
  mimeType: string,
  fileSizeBytes: number,
  context: UploadContext
): { valid: true } | { valid: false; error: string } {
  // Check MIME type
  if (!ALLOWED_IMAGE_MIMES.has(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type: ${mimeType}. Only image files are allowed (JPEG, PNG, GIF, WebP, SVG).`,
    };
  }

  // Check file size based on context
  const maxSizes: Record<UploadContext, number> = {
    qr: MAX_QR_FILE_SIZE,
    chat: MAX_CHAT_FILE_SIZE,
    avatar: MAX_AVATAR_FILE_SIZE,
  };

  const maxSize = maxSizes[context];
  if (fileSizeBytes > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File too large. Maximum size for ${context} uploads is ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validate that a URL points to an image (by extension check).
 * Used for validating URLs passed as attachment references.
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || url.length > 2000) return false;

  // Convex storage URLs are trusted
  if (url.includes(".convex.cloud") || url.includes("convex-storage")) return true;

  // Data URIs with image MIME types
  if (url.startsWith("data:image/")) return true;

  // Check file extension for external URLs
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico"];
    return imageExtensions.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

// ── Client-Side Magic Bytes Validation ──────────────────────────────────────
// Use this in browser file upload handlers BEFORE sending to Convex storage.
// This is the primary defense against disguised malicious files.

/**
 * Read the first bytes of a File and validate it's a genuine image.
 * Use in <input type="file"> onChange handlers before uploading.
 *
 * @example
 *   const result = await validateFileBeforeUpload(file, "qr");
 *   if (!result.valid) {
 *     alert(result.error);
 *     return;
 *   }
 *   // Safe to upload
 */
export async function validateFileBeforeUpload(
  file: File,
  context: UploadContext
): Promise<{ valid: true } | { valid: false; error: string }> {
  // Step 1: Validate MIME type and file size
  const sizeCheck = validateImageUpload(file.type, file.size, context);
  if (!sizeCheck.valid) return sizeCheck;

  // Step 2: Read first 16 bytes for magic bytes check
  // (We don't read the whole file — just enough to identify the format)
  const HEADER_SIZE = 16;
  const headerBytes = await file.slice(0, HEADER_SIZE).arrayBuffer();
  const headerArray = new Uint8Array(headerBytes);

  // Step 3: Validate magic bytes match claimed MIME type
  const magicCheck = validateFileMagicBytes(headerArray, file.type);
  if (!magicCheck.valid) return magicCheck;

  // Step 4: Additional SVG safety check (scan first 1KB for malicious content)
  if (file.type === "image/svg+xml") {
    const SCAN_SIZE = 1024;
    const scanBytes = await file.slice(0, SCAN_SIZE).arrayBuffer();
    const scanArray = new Uint8Array(scanBytes);
    const svgContent = new TextDecoder().decode(scanArray);
    const lowerSvg = svgContent.toLowerCase();

    if (
      lowerSvg.includes("<script") ||
      lowerSvg.includes("javascript:") ||
      lowerSvg.includes("onerror=") ||
      lowerSvg.includes("onload=") ||
      lowerSvg.includes("<iframe") ||
      lowerSvg.includes("<object") ||
      lowerSvg.includes("<embed")
    ) {
      return {
        valid: false,
        error: "SVG contains potentially malicious content (scripts/event handlers). Only static SVG images are allowed.",
      };
    }
  }

  return { valid: true };
}
