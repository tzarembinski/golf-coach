import axios from 'axios';
import DebugLogger from '../utils/debugLogger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Analyze golf swing images
 * @param {Object} images - Object containing swing position images
 * @param {Object} annotation - Optional annotation data (club, shotOutcome, focusArea, notes)
 * @param {DebugLogger} debug - Optional debug logger instance
 * @returns {Promise} Analysis result
 */
export const analyzeSwing = async (images, annotation = {}, debug = null) => {
  const formData = new FormData();

  // Add images to form data if they exist
  if (images.address) formData.append('address', images.address);
  if (images.top) formData.append('top', images.top);
  if (images.impact) formData.append('impact', images.impact);
  if (images.follow_through) formData.append('follow_through', images.follow_through);

  // Add annotation fields if they exist
  if (annotation.club) formData.append('club', annotation.club);
  if (annotation.shotOutcome) formData.append('shot_outcome', annotation.shotOutcome);
  if (annotation.focusArea) formData.append('focus_area', annotation.focusArea);
  if (annotation.notes) formData.append('notes', annotation.notes);

  // Step 4: Send FormData to backend
  if (debug) {
    debug.logStep(4, 'started', {
      imageCount: Object.values(images).filter(img => img !== null).length,
      hasClub: !!annotation.club,
      hasShotOutcome: !!annotation.shotOutcome,
      hasFocusArea: !!annotation.focusArea,
      hasNotes: !!annotation.notes,
    });
  }

  const response = await api.post('/api/swings/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      // Pass request ID to backend for tracking
      'X-Request-Id': debug ? debug.getRequestId() : undefined,
    },
  });

  if (debug) {
    debug.logStep(4, 'completed', {
      message: 'FormData sent to backend successfully',
    });
  }

  return response.data;
};

/**
 * Get all swing analyses from history
 * @returns {Promise} Array of analysis records
 */
export const getSwingHistory = async () => {
  const response = await api.get('/api/swings/history');
  return response.data.swings || [];
};

/**
 * Get a specific swing analysis by ID
 * @param {number} id - Analysis ID
 * @returns {Promise} Analysis record
 */
export const getSwingById = async (id) => {
  const response = await api.get(`/api/swings/${id}`);
  return response.data;
};

/**
 * Delete a swing analysis
 * @param {number} id - Analysis ID
 * @returns {Promise} Delete confirmation
 */
export const deleteSwing = async (id) => {
  const response = await api.delete(`/api/swings/${id}`);
  return response.data;
};

export default api;
