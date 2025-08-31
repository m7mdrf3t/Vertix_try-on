export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  type: 'person' | 'product';
  name: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

export interface TryOnParameters {
  [key: string]: any;
}

export interface PredictionRequest {
  instances: Array<{
    personImage: {
      image: {
        bytesBase64Encoded: string;
      };
    };
    productImages: Array<{
      image: {
        bytesBase64Encoded: string;
      };
    }>;
  }>;
  parameters?: TryOnParameters;
}

export interface PredictionResponse {
  predictions: Array<{
    bytesBase64Encoded: string;
  }>;
}
