/**
 * API service for communicating with the backend server
 */

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Check if backend is available
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.warn('Backend not available:', error.message);
      return false;
    }
  }

  /**
   * Upload a PDF file to the backend
   */
  async uploadFile(file, materialId) {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('materialId', materialId);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('File uploaded to backend:', result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Get file URL from backend
   */
  getFileUrl(filename) {
    return `${this.baseUrl}/files/${filename}`;
  }

  /**
   * Delete a file from backend
   */
  async deleteFile(filename) {
    try {
      const response = await fetch(`${this.baseUrl}/files/${filename}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      const result = await response.json();
      console.log('File deleted from backend:', filename);
      return result;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  /**
   * Save app state to backend
   */
  async saveState(state) {
    try {
      const response = await fetch(`${this.baseUrl}/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Save state failed');
      }

      const result = await response.json();
      console.log('State saved to backend');
      return result;
    } catch (error) {
      console.error('Save state error:', error);
      throw error;
    }
  }

  /**
   * Load app state from backend
   */
  async loadState() {
    try {
      const response = await fetch(`${this.baseUrl}/state`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Load state failed');
      }

      const state = await response.json();
      console.log('State loaded from backend');
      return state;
    } catch (error) {
      console.error('Load state error:', error);
      throw error;
    }
  }

  /**
   * Get storage information
   */
  async getStorageInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/storage/info`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Get storage info failed');
      }

      const info = await response.json();
      return info;
    } catch (error) {
      console.error('Get storage info error:', error);
      throw error;
    }
  }

  /**
   * Check if a file exists on the backend
   */
  async fileExists(filename) {
    try {
      const response = await fetch(`${this.baseUrl}/files/${filename}`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
