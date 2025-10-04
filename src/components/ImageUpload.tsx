import React, { useCallback, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { UploadedImage } from '../types';

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

  // Determine disabled state for the upload area (e.g., allow only one person image)
  const currentTypeImagesCount = uploadedImages.filter(img => img.type === type).length;
  const isDisabled = !!maxImages && currentTypeImagesCount >= maxImages;
  const alwaysShowRemove = type === 'person';

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentTypeImages = uploadedImages.filter(img => img.type === type);
    const remainingSlots = maxImages ? maxImages - currentTypeImages.length : Infinity;

    Array.from(files).slice(0, remainingSlots).forEach(file => {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9);
        const image: UploadedImage = {
          id,
          file,
          preview: URL.createObjectURL(file),
          type,
          name: file.name,
        };
        onImageUpload(image);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageUpload, type, maxImages, uploadedImages]);

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
        const id = Math.random().toString(36).substr(2, 9);
        const image: UploadedImage = {
          id,
          file,
          preview: URL.createObjectURL(file),
          type,
          name: file.name,
        };
        onImageUpload(image);
      }
    });
  }, [onImageUpload, type, maxImages, uploadedImages]);


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
      {uploadedImages.filter(img => img.type === type).length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Image Uploaded</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
