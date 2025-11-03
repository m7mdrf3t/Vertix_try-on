import { getBackendUrl } from '../config/backend';

/**
 * Sharp-based image processing service
 * Uses backend Sharp processing for advanced features
 */

export interface SharpProcessingOptions {
  maxDimension?: number;
  format?: 'jpeg' | 'png' | 'webp';
  preserveMetadata?: boolean;
}

export interface ImageMetadata {
  width: number;
  height: number;
  density: number;
  format: string;
  size: number;
  channels: number;
  hasAlpha: boolean;
}

export class SharpImageService {
  private static getAPI_BASE_URL(): string {
    return getBackendUrl();
  }

  /**
   * Process image using Sharp backend
   * @param file - Original image file
   * @param options - Processing options
   * @returns Promise<File> - Processed image file
   */
  static async processImage(
    file: File, 
    options: SharpProcessingOptions = {}
  ): Promise<{ file: File; metadata: ImageMetadata }> {
    const {
      maxDimension = 1024,
      format = 'jpeg',
      preserveMetadata = true
    } = options;

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('maxDimension', maxDimension.toString());
      formData.append('quality', '90');
      formData.append('format', format);
      formData.append('preserveMetadata', preserveMetadata.toString());

      console.log('Processing image with Sharp backend:', {
        originalSize: file.size,
        maxDimension,
        quality: 90,
        format,
        preserveMetadata
      });

      // Send to backend for processing
      const response = await fetch(`${this.getAPI_BASE_URL()}/api/process-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Sharp processing failed: ${response.statusText}`);
      }

      // Get processed image blob
      const processedBlob = await response.blob();
      
      // Extract metadata from response headers
      const metadata: ImageMetadata = {
        width: parseInt(response.headers.get('X-Dimensions')?.split('x')[0] || '0'),
        height: parseInt(response.headers.get('X-Dimensions')?.split('x')[1] || '0'),
        density: parseInt(response.headers.get('X-DPI') || '72'),
        format: response.headers.get('Content-Type')?.split('/')[1] || 'jpeg',
        size: parseInt(response.headers.get('X-Processed-Size') || '0'),
        channels: 3, // Default, Sharp doesn't expose this in headers
        hasAlpha: false // Default, Sharp doesn't expose this in headers
      };

      // Create new file from processed blob
      const processedFile = new File([processedBlob], file.name, {
        type: `image/${format}`,
        lastModified: Date.now(),
      });

      console.log('Sharp processing completed:', {
        originalSize: file.size,
        processedSize: processedFile.size,
        dimensions: `${metadata.width}x${metadata.height}`,
        dpi: metadata.density,
        compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(1) + '%'
      });

      return { file: processedFile, metadata };

    } catch (error) {
      console.error('Error processing image with Sharp:', error);
      throw error;
    }
  }

  /**
   * Get image metadata using Sharp backend
   * @param file - Image file
   * @returns Promise<ImageMetadata> - Image metadata
   */
  static async getImageMetadata(file: File): Promise<ImageMetadata> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.getAPI_BASE_URL()}/api/image-metadata`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Metadata extraction failed: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Error getting image metadata:', error);
      throw error;
    }
  }

  /**
   * Format file size for display
   * @param bytes - File size in bytes
   * @returns string - Formatted file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
