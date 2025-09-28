import React, { useState, useCallback } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { ProductSelector } from './components/ProductSelector';
import { ProcessingStatus } from './components/ProcessingStatus';
import { AdvancedOptions } from './components/AdvancedOptions';
import { VirtualTryOnAPI } from './services/api';
import { UploadedImage, Product, ProcessingState, TryOnParameters } from './types';

function App() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
  });
  const [resultImage, setResultImage] = useState<string | undefined>();
  const [parameters, setParameters] = useState<TryOnParameters>({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const ctrlPressCountRef = React.useRef(0);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setUploadedImages(prev => [...prev, image]);
  }, []);

  const handleImageRemove = useCallback((id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleProductSelect = useCallback((product: Product) => {
    // Enforce single selection: always replace with the newly selected product
    setSelectedProducts([product]);
  }, []);

  const handleProductRemove = useCallback((productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  // Handle Ctrl key press to show advanced options
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Control' || event.ctrlKey) {
      ctrlPressCountRef.current++;
      if (ctrlPressCountRef.current >= 3) {
        setShowAdvancedOptions(true);
        ctrlPressCountRef.current = 0;
      }
    }
  }, []);

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Helper function to convert image URL to base64
  const convertImageUrlToBase64 = async (imageUrl: string): Promise<string> => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleProcess = useCallback(async () => {
    const personImages = uploadedImages.filter(img => img.type === 'person');

    if (personImages.length === 0) {
      setProcessingState({
        isProcessing: false,
        progress: 0,
        error: 'Please upload at least one person image',
      });
      return;
    }

    if (selectedProducts.length === 0) {
      setProcessingState({
        isProcessing: false,
        progress: 0,
        error: 'Please select at least one product',
      });
      return;
    }

    setProcessingState({
      isProcessing: true,
      progress: 0,
      error: null,
    });
    setResultImage(undefined);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 1000);

      // Convert images to base64
      const personImageBase64 = await VirtualTryOnAPI.convertImageToBase64(personImages[0].file);
      const productImagesBase64 = await Promise.all(
        selectedProducts.map(product => convertImageUrlToBase64(product.image))
      );

      // Prepare request
      const request = {
        instances: [{
          personImage: {
            image: {
              bytesBase64Encoded: personImageBase64,
            },
          },
          productImages: productImagesBase64.map(base64 => ({
            image: {
              bytesBase64Encoded: base64,
            },
          })),
        }],
        parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
      };

      // Call API
      const response = await VirtualTryOnAPI.predict(request);

      clearInterval(progressInterval);
      setProcessingState(prev => ({
        ...prev,
        progress: 100,
      }));

      // Set result
      if (response.predictions && response.predictions.length > 0) {
        setResultImage(response.predictions[0].bytesBase64Encoded);
      }

      setProcessingState({
        isProcessing: false,
        progress: 100,
        error: null,
      });
    } catch (error) {
      setProcessingState({
        isProcessing: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }, [uploadedImages, selectedProducts, parameters]);

  const handleDownload = useCallback(() => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${resultImage}`;
    link.download = `virtual-try-on-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [resultImage]);

  const canProcess = uploadedImages.filter(img => img.type === 'person').length > 0 &&
                    selectedProducts.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src="/Mirrify.jpg" alt="Mirrify Logo" className="w-8 h-8 rounded-full" />
              <h1 className="text-xl font-bold text-gray-900">Mirrify</h1>
            </div>
            <div className="text-sm text-gray-500">
              by Creative spaces
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Virtual Try-On Experience
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload a person's photo and product images to see how they would look wearing the products.
              Our AI-powered virtual try-on technology provides realistic results.
            </p>
          </div>



          {/* Image Upload and Product Selection Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Person Image</h3>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                uploadedImages={uploadedImages}
                type="person"
                maxImages={1}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Product</h3>
              <ProductSelector
                onProductSelect={handleProductSelect}
                onProductRemove={handleProductRemove}
                selectedProducts={selectedProducts}
                maxProducts={1}
              />
            </div>
          </div>

          {/* Advanced Options - Hidden by default, shown after 3 Ctrl presses */}
          {showAdvancedOptions && (
            <AdvancedOptions
              parameters={parameters}
              onParametersChange={setParameters}
            />
          )}
          
          {/* Hidden feature hint */}
          {!showAdvancedOptions && (
            <div className="text-center text-xs text-gray-400 opacity-50">
              💡 Press Ctrl 3 times to unlock advanced options
            </div>
          )}

          {/* Process Button */}
          <div className="flex justify-center">
            <button
              onClick={handleProcess}
              disabled={!canProcess || processingState.isProcessing}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                canProcess && !processingState.isProcessing
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {processingState.isProcessing ? 'Processing...' : 'Generate Virtual Try-On'}
            </button>
          </div>

          {/* Processing Status and Results */}
          <ProcessingStatus
            processingState={processingState}
            resultImage={resultImage}
            onDownload={handleDownload}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 Mirrify. by Creative spaces</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
