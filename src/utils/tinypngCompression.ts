import { getBackendUrl } from '../config/backend';

/**
 * Compresses an image using TinyPNG API through backend proxy
 * @param file - The original image file
 * @param maxDimension - Maximum dimension (width or height) (default: 1024)
 * @returns Promise<File> - The compressed image file
 */
export const compressImageWithTinyPNG = async (
  file: File, 
  maxDimension: number = 1024
): Promise<File> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Get API base URL from backend configuration
      const API_BASE_URL = getBackendUrl();
      
      // Call TinyPNG compression endpoint
      const response = await fetch(`${API_BASE_URL}/api/compress-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          maxDimension: maxDimension
        })
      });

      const result = await response.json();

      if (result.success) {
        // Convert base64 back to file
        const compressedFile = base64ToFile(result.compressedImage, file.name, file.type);
        
        console.log(`✅ TinyPNG compression successful:`);
        console.log(`   📏 Original: ${result.originalDimensions.width}x${result.originalDimensions.height}`);
        console.log(`   📏 Final: ${result.processedDimensions.width}x${result.processedDimensions.height}`);
        console.log(`   📦 Size reduction: ${result.compressionRatio}% (${result.originalSize} → ${result.compressedSize} bytes)`);
        console.log(`   🔄 Resized: ${result.wasResized ? 'Yes' : 'No (maintained original resolution)'}`);
        
        resolve(compressedFile);
      } else if (result.fallback) {
        // TinyPNG not available, fall back to client-side compression
        console.log('TinyPNG not available, using fallback compression');
        throw new Error('TinyPNG fallback required');
      } else {
        throw new Error(result.error || 'Compression failed');
      }

    } catch (error) {
      console.error('TinyPNG compression error:', error);
      reject(error);
    }
  });
};

/**
 * Converts a File to base64 data URL
 * @param file - The file to convert
 * @returns Promise<string> - Base64 data URL
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Converts base64 data URL to File
 * @param base64 - Base64 data URL
 * @param filename - Original filename
 * @param mimeType - MIME type
 * @returns File - The converted file
 */
const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || mimeType;
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

/**
 * Gets image dimensions without loading the full image
 * @param file - The image file
 * @returns Promise<{width: number, height: number}> - Image dimensions
 */
export const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns string - Formatted file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
