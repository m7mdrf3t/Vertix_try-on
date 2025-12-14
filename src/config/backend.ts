/**
 * Backend Configuration
 * 
 * This file manages backend server URLs and allows easy switching between
 * different backend deployments.
 */

export const BACKEND_CONFIG = {
  // Current active backend (new deployment)
  // NEW Backend: https://mirrify-backend-v2-cafok76baq-uc.a.run.app
  CURRENT: process.env.REACT_APP_API_URL || 'https://mirrify-backend-v2-cafok76baq-uc.a.run.app',
  
  // Previous backend (kept for rollback/fallback)
  // OLD Backend: https://mirrify-backend-907099703781.us-central1.run.app
  PREVIOUS: 'https://mirrify-backend-907099703781.us-central1.run.app',
  
  // Alternative: You can use environment variable to switch
  // Set REACT_APP_API_URL in your .env file to override
} as const;

/**
 * Get the current backend URL
 */
export const getBackendUrl = (): string => {
  return BACKEND_CONFIG.CURRENT;
};

/**
 * Get the previous backend URL (for rollback)
 */
export const getPreviousBackendUrl = (): string => {
  return BACKEND_CONFIG.PREVIOUS;
};

/**
 * Check which backend is currently active
 */
export const isUsingNewBackend = (): boolean => {
  return BACKEND_CONFIG.CURRENT !== BACKEND_CONFIG.PREVIOUS;
};

