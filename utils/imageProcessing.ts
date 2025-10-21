import imageCompression from 'browser-image-compression';

export interface ImageCompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker?: boolean;
  initialQuality?: number;
}

/**
 * Process an image file: convert HEIC to WEBP if needed, then compress
 */
export const processImage = async (
  file: File,
  compressionOptions: ImageCompressionOptions
): Promise<string> => {
  let fileToCompress = file;

  // Check if file is HEIC/HEIF and convert to WEBP
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    // Dynamically import heic2any only in the browser (client-side)
    const heic2any = (await import('heic2any')).default;

    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/webp',
      quality: 0.9
    });

    // heic2any can return Blob or Blob[], handle both cases
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    fileToCompress = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.webp'), {
      type: 'image/webp'
    });
  }

  // Compress the image
  const compressedFile = await imageCompression(fileToCompress, compressionOptions);

  // Convert compressed file to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        resolve(readerEvent.target.result as string);
      } else {
        reject(new Error(`Failed to read file: ${file.name}`));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(compressedFile);
  });
};

/**
 * Validate if a file type is supported
 * @param file - The file to validate
 * @returns boolean - true if supported
 */
export const isValidImageType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  return allowedTypes.includes(file.type);
};

/**
 * Get list of supported image formats for display
 */
export const SUPPORTED_IMAGE_FORMATS = 'JPG, PNG, WEBP, or HEIC';

/**
 * Calculate the actual payload size of a base64 string (for network transfer)
 * This is the size of the string itself, not the decoded data
 * @param base64String - The base64 data URL
 * @returns number - Size in bytes (string length)
 */
export const getBase64Size = (base64String: string): number => {
  // The actual size being sent over the network is the string length in bytes
  // Each character in JavaScript strings is typically 1 byte for ASCII (base64 chars)
  // but we need to account for the full string including the data URL prefix
  return new Blob([base64String]).size;
};

/**
 * Batch base64 images by size limit
 * @returns Array of batches, where each batch is an array of {image: string, originalIndex: number}
 */
export const batchImagesBySize = (
  images: string[], // Array of base64 image strings
  maxBatchSizeBytes: number = 750 * 1024 // 750KB (leaving 250KB buffer for JSON overhead + safety margin)
): Array<Array<{ image: string; originalIndex: number }>> => {
  const batches: Array<Array<{ image: string; originalIndex: number }>> = [];
  let currentBatch: Array<{ image: string; originalIndex: number }> = [];
  let currentBatchSize = 0;

  // Estimate JSON overhead (quotes, commas, brackets, field names, etc.)
  const JSON_OVERHEAD_PER_IMAGE = 50; // bytes for JSON structure per image
  const BASE_JSON_OVERHEAD = 200; // bytes for the overall JSON structure

  images.forEach((image, index) => {
    const imageSize = getBase64Size(image);
    const totalImageSize = imageSize + JSON_OVERHEAD_PER_IMAGE;

    // Calculate what the batch size would be if we add this image
    const potentialBatchSize = currentBatchSize + totalImageSize + (currentBatch.length === 0 ? BASE_JSON_OVERHEAD : 0);

    // If adding this image would exceed the limit, start a new batch
    if (potentialBatchSize > maxBatchSizeBytes && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [];
      currentBatchSize = 0;
    }

    // Add image to current batch
    currentBatch.push({ image, originalIndex: index });

    // Add base JSON overhead for first image in batch
    if (currentBatch.length === 1) {
      currentBatchSize += BASE_JSON_OVERHEAD;
    }

    currentBatchSize += totalImageSize;
  });

  // Add the last batch if it has images
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
};
