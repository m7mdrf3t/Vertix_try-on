import React, { useState, useCallback } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { ProcessingStatus } from './components/ProcessingStatus';
import { AdvancedOptions } from './components/AdvancedOptions';
import { VirtualTryOnAPI } from './services/api';
import { UploadedImage, ProcessingState, TryOnParameters } from './types';

function App() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
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

  const handleProcess = useCallback(async () => {
    const personImages = uploadedImages.filter(img => img.type === 'person');
    const productImages = uploadedImages.filter(img => img.type === 'product');

    if (personImages.length === 0) {
      setProcessingState({
        isProcessing: false,
        progress: 0,
        error: 'Please upload at least one person image',
      });
      return;
    }

    if (productImages.length === 0) {
      setProcessingState({
        isProcessing: false,
        progress: 0,
        error: 'Please upload at least one product image',
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
        productImages.map(img => VirtualTryOnAPI.convertImageToBase64(img.file))
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
  }, [uploadedImages, parameters]);

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
                    uploadedImages.filter(img => img.type === 'product').length > 0;

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



          {/* Image Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ImageUpload
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              uploadedImages={uploadedImages}
              type="person"
            />
            <ImageUpload
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              uploadedImages={uploadedImages}
              type="product"
              maxImages={5}
            />
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
