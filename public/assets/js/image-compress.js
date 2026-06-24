// image-compress.js — wrapper for browser-image-compression (loaded via CDN)
// Ensures all photos are compressed before upload to Firebase Storage

// Max dimensions and quality for listing photos
const COMPRESS_OPTIONS = {
  maxSizeMB: 0.8,           // target ≤ 800 KB
  maxWidthOrHeight: 1280,   // no side > 1280px
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.82,
};

/**
 * Compress a single File object.
 * Returns a compressed File (still a File, not just Blob).
 */
export async function compressImage(file) {
  // imageCompression is loaded from CDN as a global
  if (typeof imageCompression === 'undefined') {
    console.warn('browser-image-compression not loaded — uploading original');
    return file;
  }
  try {
    const compressed = await imageCompression(file, COMPRESS_OPTIONS);
    // imageCompression returns a Blob; wrap back to File for Storage SDK
    return new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err) {
    console.error('Compression failed, using original:', err);
    return file;
  }
}

/**
 * Compress multiple files and return a list of {original, compressed, previewUrl}.
 */
export async function compressImages(files) {
  const results = [];
  for (const file of files) {
    const compressed = await compressImage(file);
    const previewUrl = URL.createObjectURL(compressed);
    results.push({ original: file, compressed, previewUrl });
  }
  return results;
}
