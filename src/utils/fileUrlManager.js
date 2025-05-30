/**
 * File URL Manager for handling persistent file URLs
 * Manages the creation and cleanup of blob URLs for files stored in IndexedDB
 */

import fileStorage from './fileStorage';

class FileUrlManager {
  constructor() {
    this.urlCache = new Map(); // Cache blob URLs to avoid recreating them
    this.urlRefs = new Map();  // Track reference counts for cleanup
  }

  /**
   * Get a persistent URL for a file
   * @param {string} materialId - The material ID
   * @returns {Promise<string|null>} - Returns a blob URL or null if file not found
   */
  async getFileUrl(materialId) {
    // Check if we already have a cached URL
    if (this.urlCache.has(materialId)) {
      const cachedUrl = this.urlCache.get(materialId);
      // Increment reference count
      this.urlRefs.set(materialId, (this.urlRefs.get(materialId) || 0) + 1);
      return cachedUrl;
    }

    try {
      // Retrieve file from IndexedDB
      const blob = await fileStorage.getFile(materialId);
      if (!blob) {
        console.warn('File not found in storage:', materialId);
        return null;
      }

      // Create blob URL
      const url = URL.createObjectURL(blob);
      
      // Cache the URL
      this.urlCache.set(materialId, url);
      this.urlRefs.set(materialId, 1);

      console.log('Created persistent URL for:', materialId);
      return url;
    } catch (error) {
      console.error('Failed to get file URL:', error);
      return null;
    }
  }

  /**
   * Release a file URL (decrement reference count)
   * @param {string} materialId - The material ID
   */
  releaseFileUrl(materialId) {
    const refCount = this.urlRefs.get(materialId) || 0;
    if (refCount <= 1) {
      // No more references, clean up
      const url = this.urlCache.get(materialId);
      if (url) {
        URL.revokeObjectURL(url);
        this.urlCache.delete(materialId);
        this.urlRefs.delete(materialId);
        console.log('Cleaned up URL for:', materialId);
      }
    } else {
      // Decrement reference count
      this.urlRefs.set(materialId, refCount - 1);
    }
  }

  /**
   * Store a file and return its persistent URL
   * @param {string} materialId - The material ID
   * @param {File} file - The file to store
   * @param {string} fileName - Original file name
   * @returns {Promise<string|null>} - Returns a blob URL or null if failed
   */
  async storeFileAndGetUrl(materialId, file, fileName) {
    try {
      // Store file in IndexedDB
      await fileStorage.storeFile(materialId, file, fileName);
      
      // Create and cache blob URL
      const url = URL.createObjectURL(file);
      this.urlCache.set(materialId, url);
      this.urlRefs.set(materialId, 1);

      console.log('Stored file and created URL for:', fileName);
      return url;
    } catch (error) {
      console.error('Failed to store file and create URL:', error);
      return null;
    }
  }

  /**
   * Update an existing file and return new URL
   * @param {string} materialId - The material ID
   * @param {File} file - The new file
   * @param {string} fileName - New file name
   * @returns {Promise<string|null>} - Returns a blob URL or null if failed
   */
  async updateFileAndGetUrl(materialId, file, fileName) {
    try {
      // Clean up old URL if it exists
      this.releaseFileUrl(materialId);

      // Store new file and get URL
      return await this.storeFileAndGetUrl(materialId, file, fileName);
    } catch (error) {
      console.error('Failed to update file and create URL:', error);
      return null;
    }
  }

  /**
   * Delete a file and clean up its URL
   * @param {string} materialId - The material ID
   * @returns {Promise<boolean>} - Returns true if deleted successfully
   */
  async deleteFile(materialId) {
    try {
      // Clean up URL
      this.releaseFileUrl(materialId);

      // Delete from IndexedDB
      return await fileStorage.deleteFile(materialId);
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  /**
   * Check if a file is available (either cached or in storage)
   * @param {string} materialId - The material ID
   * @returns {Promise<boolean>} - Returns true if file is available
   */
  async isFileAvailable(materialId) {
    // Check cache first
    if (this.urlCache.has(materialId)) {
      return true;
    }

    // Check IndexedDB
    return await fileStorage.fileExists(materialId);
  }

  /**
   * Get file information
   * @param {string} materialId - The material ID
   * @returns {Promise<Object|null>} - Returns file metadata or null
   */
  async getFileInfo(materialId) {
    return await fileStorage.getFileInfo(materialId);
  }

  /**
   * Preload files for materials that need them
   * @param {Array} materials - Array of study materials
   * @returns {Promise<Map>} - Returns a map of materialId -> URL
   */
  async preloadFiles(materials) {
    const urlMap = new Map();
    
    for (const material of materials) {
      if (material.type === 'pdf' && material.id) {
        const url = await this.getFileUrl(material.id);
        if (url) {
          urlMap.set(material.id, url);
        }
      }
    }

    return urlMap;
  }

  /**
   * Clean up all cached URLs (call on app unmount)
   */
  cleanup() {
    for (const [materialId, url] of this.urlCache) {
      URL.revokeObjectURL(url);
    }
    this.urlCache.clear();
    this.urlRefs.clear();
    console.log('Cleaned up all file URLs');
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} - Returns storage usage info
   */
  async getStorageStats() {
    try {
      const files = await fileStorage.getAllFiles();
      const totalSize = files.reduce((sum, file) => sum + (file.fileSize || 0), 0);
      
      return {
        fileCount: files.length,
        totalSize: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        files: files.map(file => ({
          id: file.id,
          fileName: file.fileName,
          fileSize: file.fileSize,
          storedAt: file.storedAt
        }))
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        fileCount: 0,
        totalSize: 0,
        totalSizeMB: '0.00',
        files: []
      };
    }
  }
}

// Create singleton instance
const fileUrlManager = new FileUrlManager();

export default fileUrlManager;
