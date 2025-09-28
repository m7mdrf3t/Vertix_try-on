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

  const changeImageType = useCallback((id: string, newType: 'person' | 'product') => {
    // This would need to be handled by the parent component
    // For now, we'll just update the local state
    console.log(`Changing image ${id} type to ${newType}`);
  }, []);

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
            Upload {type === 'person' ? 'Person' : 'Product'} Images
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
          <h3 className="text-lg font-medium text-gray-900">Uploaded {type === 'person' ? 'Person' : 'Product'} Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.filter(img => img.type === type).map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image Type Selector */}
                <div className="absolute top-2 left-2">
                  <select
                    value={image.type}
                    onChange={(e) => changeImageType(image.id, e.target.value as 'person' | 'product')}
                    className="text-xs bg-white/90 backdrop-blur-sm border border-gray-300 rounded px-2 py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="person">Person</option>
                    <option value="product">Product</option>
                  </select>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onImageRemove(image.id)}
                  className={`absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 transition-opacity ${alwaysShowRemove ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Image Name */}
                <div className="mt-2">
                  <p className="text-sm text-gray-600 truncate">{image.name}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    image.type === 'person' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {image.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
