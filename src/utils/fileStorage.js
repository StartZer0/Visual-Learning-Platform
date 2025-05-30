/**
 * IndexedDB-based file storage utility for persistent file storage
 * Stores actual file data that persists across browser sessions
 */

const DB_NAME = 'VisualLearningPlatform';
const DB_VERSION = 1;
const STORE_NAME = 'files';

class FileStorage {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for files
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('materialId', 'materialId', { unique: true });
          store.createIndex('fileName', 'fileName', { unique: false });
        }
      };
    });
  }

  async ensureReady() {
    if (!this.db) {
      await this.initPromise;
    }
  }

  /**
   * Store a file in IndexedDB
   * @param {string} materialId - Unique identifier for the study material
   * @param {File} file - The file to store
   * @param {string} fileName - Original file name
   * @returns {Promise<string>} - Returns a persistent file ID
   */
  async storeFile(materialId, file, fileName) {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Convert file to ArrayBuffer for storage
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = {
          id: materialId,
          materialId: materialId,
          fileName: fileName,
          fileType: file.type,
          fileSize: file.size,
          data: reader.result, // ArrayBuffer
          storedAt: new Date().toISOString()
        };

        const request = store.put(fileData);
        
        request.onsuccess = () => {
          console.log('File stored successfully:', fileName);
          resolve(materialId);
        };

        request.onerror = () => {
          console.error('Failed to store file:', request.error);
          reject(request.error);
        };
      };

      reader.onerror = () => {
        console.error('Failed to read file:', reader.error);
        reject(reader.error);
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Retrieve a file from IndexedDB
   * @param {string} materialId - The material ID
   * @returns {Promise<Blob|null>} - Returns a Blob object or null if not found
   */
  async getFile(materialId) {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(materialId);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Convert ArrayBuffer back to Blob
          const blob = new Blob([result.data], { type: result.fileType });
          resolve(blob);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Failed to retrieve file:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get file info without the actual data
   * @param {string} materialId - The material ID
   * @returns {Promise<Object|null>} - Returns file metadata or null
   */
  async getFileInfo(materialId) {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(materialId);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { data, ...fileInfo } = result;
          resolve(fileInfo);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Failed to retrieve file info:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete a file from IndexedDB
   * @param {string} materialId - The material ID
   * @returns {Promise<boolean>} - Returns true if deleted successfully
   */
  async deleteFile(materialId) {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(materialId);

      request.onsuccess = () => {
        console.log('File deleted successfully:', materialId);
        resolve(true);
      };

      request.onerror = () => {
        console.error('Failed to delete file:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Check if a file exists in storage
   * @param {string} materialId - The material ID
   * @returns {Promise<boolean>} - Returns true if file exists
   */
  async fileExists(materialId) {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count(materialId);

      request.onsuccess = () => {
        resolve(request.result > 0);
      };

      request.onerror = () => {
        console.error('Failed to check file existence:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all stored files info
   * @returns {Promise<Array>} - Returns array of file metadata
   */
  async getAllFiles() {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const files = request.result.map(file => {
          const { data, ...fileInfo } = file;
          return fileInfo;
        });
        resolve(files);
      };

      request.onerror = () => {
        console.error('Failed to get all files:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear all stored files (for cleanup/reset)
   * @returns {Promise<boolean>} - Returns true if cleared successfully
   */
  async clearAllFiles() {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All files cleared successfully');
        resolve(true);
      };

      request.onerror = () => {
        console.error('Failed to clear files:', request.error);
        reject(request.error);
      };
    });
  }
}

// Create singleton instance
const fileStorage = new FileStorage();

export default fileStorage;
