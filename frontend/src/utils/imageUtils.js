/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateImage = (file) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: 'File size exceeds 10MB. Please upload a smaller image.'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Create image preview URL
 * @param {File} file - Image file
 * @returns {string} Object URL for preview
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoke image preview URL to free memory
 * @param {string} url - Object URL to revoke
 */
export const revokeImagePreview = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Convert base64 to blob URL for display
 * @param {string} base64 - Base64 encoded image
 * @returns {string} Blob URL
 */
export const base64ToBlob = (base64) => {
  if (!base64) return null;

  // Check if it's already a data URL
  if (base64.startsWith('data:image')) {
    return base64;
  }

  // Assume JPEG if no prefix
  return `data:image/jpeg;base64,${base64}`;
};
