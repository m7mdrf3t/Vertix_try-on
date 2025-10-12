import React from 'react';
import { Loader2, CheckCircle, XCircle, Download } from 'lucide-react';
import { ProcessingState } from '../types';

interface ProcessingStatusProps {
  processingState: ProcessingState;
  resultImage?: string;
  onDownload?: () => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  processingState,
  resultImage,
  onDownload,
}) => {
  const { isProcessing, progress, error } = processingState;

  if (!isProcessing && !error && !resultImage) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Processing Status
      </h3>

      {isProcessing && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                Magic in Progress...
              </p>
              <p className="text-xs text-gray-500">
                30 seconds to fabulous!
              </p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {progress}% complete
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-3">
          <XCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-700">
              Processing failed
            </p>
            <p className="text-xs text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {resultImage && !isProcessing && !error && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700">
                Processing completed successfully!
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <img
              src={`data:image/jpeg;base64,${resultImage}`}
              alt="Virtual try-on result"
              className="w-full max-w-md mx-auto rounded-lg shadow-sm"
            />
          </div>

          {onDownload && (
            <div className="flex justify-center gap-4">
              <button
                onClick={onDownload}
                className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Result</span>
              </button>
              <button
                onClick={() => {
                  // Add to cart functionality - placeholder for now
                  alert('Product Add to cart!');
                }}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>Add to Cart</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};






