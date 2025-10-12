/**
 * Compresses an image file to a maximum dimension of 1024px while maintaining aspect ratio
 * @param file - The original image file
 * @param maxDimension - Maximum dimension (width or height) (default: 1024)
 * @param quality - Compression quality 0-1 (default: 0.9)
 * @returns Promise<File> - The compressed image file
 */
export const compressImage = (
  file: File, 
  maxDimension: number = 1024, 
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      // Determine which dimension is larger and scale accordingly
      if (width > height) {
        // Width is larger, scale to maxDimension
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        // Height is larger, scale to maxDimension
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and resize
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with resized data
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
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
