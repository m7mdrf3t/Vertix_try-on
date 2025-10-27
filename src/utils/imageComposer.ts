/**
 * Image Composer Utility
 * Combines two garment images (upper and lower) into a single composite image
 */

export interface ImageCompositionResult {
  base64: string;
  width: number;
  height: number;
}

/**
 * Load an image from URL and return it as a loaded Image element
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Get image data from a File object
 */
async function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Combine two garment images into one composite image
 * The images are stacked vertically (upper garment on top, lower garment below)
 * 
 * @param upperImageUrl - URL or File of the upper garment
 * @param lowerImageUrl - URL or File of the lower garment
 * @param canvasWidth - Width of the final composite image (optional, will auto-size)
 * @returns Base64 encoded composite image
 */
export async function combineGarments(
  upperImageUrl: string | File,
  lowerImageUrl: string | File,
  canvasWidth: number = 800
): Promise<ImageCompositionResult> {
  try {
    // Load both images
    let upperImg: HTMLImageElement;
    let lowerImg: HTMLImageElement;

    if (upperImageUrl instanceof File) {
      upperImg = await fileToImage(upperImageUrl);
    } else {
      upperImg = await loadImage(upperImageUrl);
    }

    if (lowerImageUrl instanceof File) {
      lowerImg = await fileToImage(lowerImageUrl);
    } else {
      lowerImg = await loadImage(lowerImageUrl);
    }

    // Calculate dimensions
    const scale = canvasWidth / Math.max(upperImg.width, lowerImg.width);
    const upperWidth = upperImg.width * scale;
    const upperHeight = upperImg.height * scale;
    const lowerWidth = lowerImg.width * scale;
    const lowerHeight = lowerImg.height * scale;

    // Calculate total height
    const totalHeight = upperHeight + lowerHeight;
    const finalWidth = Math.max(upperWidth, lowerWidth);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, finalWidth, totalHeight);

    // Draw upper garment (top half)
    ctx.drawImage(upperImg, 0, 0, upperWidth, upperHeight);

    // Draw lower garment (bottom half)
    ctx.drawImage(lowerImg, 0, upperHeight, lowerWidth, lowerHeight);

    // Convert to base64
    const base64 = canvas.toDataURL('image/jpeg', 0.95);

    return {
      base64,
      width: finalWidth,
      height: totalHeight,
    };
  } catch (error) {
    console.error('Error combining garments:', error);
    throw new Error('Failed to combine garment images');
  }
}

/**
 * Convert base64 image to base64 data (without data URL prefix)
 */
export function getBase64Data(base64: string): string {
  return base64.includes(',') ? base64.split(',')[1] : base64;
}

