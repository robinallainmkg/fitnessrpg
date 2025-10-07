/**
 * Utility to retry Firestore operations with exponential backoff
 * Handles transient [firestore/unavailable] errors
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a Firestore operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @param {number} baseDelay - Base delay in ms (default: 500)
 * @returns {Promise} Result of the operation
 */
export const retryFirestoreOperation = async (operation, maxRetries = 2, baseDelay = 500) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Only retry on unavailable errors
      if (error.code === 'firestore/unavailable' && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff: 500ms, 1s
        // Silent retry - no logs to avoid console spam
        await sleep(delay);
      } else {
        // Don't retry other errors or if max retries reached
        throw error;
      }
    }
  }
  
  throw lastError;
};

/**
 * Wrapper for Firestore get operations with retry
 * Reduced retries to 2 for faster failure detection
 */
export const getWithRetry = async (ref, maxRetries = 2) => {
  return retryFirestoreOperation(() => ref.get(), maxRetries);
};

/**
 * Wrapper for Firestore set operations with retry
 */
export const setWithRetry = async (ref, data, maxRetries = 3) => {
  return retryFirestoreOperation(() => ref.set(data), maxRetries);
};

/**
 * Wrapper for Firestore update operations with retry
 */
export const updateWithRetry = async (ref, data, maxRetries = 3) => {
  return retryFirestoreOperation(() => ref.update(data), maxRetries);
};
