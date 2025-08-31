import axios from 'axios';
import { TryOnRequest, TryOnResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export class VirtualTryOnAPI {
  static async predict(request: TryOnRequest): Promise<TryOnResponse> {
    try {
      const response = await axios.post<TryOnResponse>(
        `${API_BASE_URL}/api/try-on`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 300000, // 5 minutes timeout for processing
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
        throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  static async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
