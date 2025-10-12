import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { UploadedImage } from '../types';
import { compressImageWithTinyPNG, getImageDimensions, formatFileSize } from '../utils/tinypngCompression';
import { compressImage } from '../utils/imageCompression';
import { SharpImageService, SharpProcessingOptions } from '../services/sharpImageService';

interface ImageUploadProps {
  onImageUpload: (image: UploadedImage) => void;
  onImageRemove: (id: string) => void;
  uploadedImages: UploadedImage[];
  type?: 'person' | 'product';
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageRemove,
  uploadedImages,
  type = 'person',
  maxImages,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressingImages, setCompressingImages] = useState<Set<string>>(new Set());

  // Determine disabled state for the upload area (e.g., allow only one person image)
  const currentTypeImagesCount = uploadedImages.filter(img => img.type === type).length;
  const isDisabled = !!maxImages && currentTypeImagesCount >= maxImages;
  const alwaysShowRemove = type === 'person';

  // Process image with optimized compression strategy
  const processImage = useCallback(async (file: File): Promise<void> => {
    const id = Math.random().toString(36).substr(2, 9);
    
    try {
      // Add to compressing set
      setCompressingImages(prev => new Set(prev).add(id));
      
      console.log(`Processing image: ${file.name}, ${SharpImageService.formatFileSize(file.size)}`);
      
      let processedFile: File;
      
      // For large images (>5MB), pre-compress on client side first
      if (file.size > 5 * 1024 * 1024) {
        console.log('Large image detected, pre-compressing on client side...');
        processedFile = await compressImage(file, 1024, 0.8); // 80% quality for pre-compression
        console.log(`Pre-compressed to: ${SharpImageService.formatFileSize(processedFile.size)}`);
      } else {
        // For smaller images, try Sharp processing directly
        try {
          console.log('Attempting Sharp processing...');
          const sharpOptions: SharpProcessingOptions = {
            maxDimension: 1024,
            format: 'jpeg',
            preserveMetadata: true
          };
          
          const result = await SharpImageService.processImage(file, sharpOptions);
          processedFile = result.file;
          console.log(`Sharp processed image: ${result.metadata.width}x${result.metadata.height}, ${SharpImageService.formatFileSize(processedFile.size)}, DPI: ${result.metadata.density}`);
        } catch (sharpError: unknown) {
          // Fallback to client-side compression
          console.log('⚠️ Sharp failed, using client-side compression:', sharpError instanceof Error ? sharpError.message : 'Unknown error');
          processedFile = await compressImage(file, 1024, 0.9);
          console.log('✅ Client-side compression successful');
        }
      }
      
      const image: UploadedImage = {
        id,
        file: processedFile,
        preview: URL.createObjectURL(processedFile),
        type,
        name: file.name,
      };
      
      onImageUpload(image);
    } catch (error) {
      console.error('Error processing image:', error);
      // Fallback to original file if all processing fails
      const image: UploadedImage = {
        id,
        file,
        preview: URL.createObjectURL(file),
        type,
        name: file.name,
      };
      onImageUpload(image);
    } finally {
      // Remove from compressing set
      setCompressingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [onImageUpload, type]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentTypeImages = uploadedImages.filter(img => img.type === type);
    const remainingSlots = maxImages ? maxImages - currentTypeImages.length : Infinity;

    Array.from(files).slice(0, remainingSlots).forEach(file => {
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processImage, type, maxImages, uploadedImages]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    // Prevent default to allow drop, but do nothing further if disabled
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    
    const currentTypeImages = uploadedImages.filter(img => img.type === type);
    const remainingSlots = maxImages ? maxImages - currentTypeImages.length : Infinity;
    
    Array.from(files).slice(0, remainingSlots).forEach(file => {
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    });
  }, [processImage, type, maxImages, uploadedImages]);


  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!isDisabled && (
        <div
          className={"border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            {type === 'person' ? 'Upload Your Image' : 'Upload Product Images'}
          </p>
          <p className="text-sm text-gray-500">
            {isDisabled
              ? 'Maximum reached. Remove an image to upload a new one.'
              : 'Drag and drop images here, or click to select files'}
            {maxImages && (
              <span className="block mt-1">
                Max {maxImages} {type === 'person' ? 'person' : 'product'} image{maxImages > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        </div>
      )}

      {/* Uploaded Images */}
      {(uploadedImages.filter(img => img.type === type).length > 0 || compressingImages.size > 0) && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            {compressingImages.size > 0 ? 'Processing Images...' : 'Images Uploaded'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Show compressing placeholders */}
            {Array.from(compressingImages).map((id) => (
              <div key={`compressing-${id}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                    <p className="text-xs text-gray-500 mt-2">Processing...</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show uploaded images */}
            {uploadedImages.filter(img => img.type === type).map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => onImageRemove(image.id)}
                  className={`absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 transition-opacity ${alwaysShowRemove ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
