import { useState, useEffect } from 'react';

interface CacheConfig {
  maxAge?: number; // в миллисекундах, по умолчанию 24 часа
  maxEntries?: number; // максимальное количество записей
}

const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000; // 24 часа
const DEFAULT_MAX_ENTRIES = 50;
const DB_NAME = 'ImageCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const useIndexedDBCache = (config: CacheConfig = {}) => {
  const { maxAge = DEFAULT_MAX_AGE, maxEntries = DEFAULT_MAX_ENTRIES } = config;

  const getFromCache = async (url: string): Promise<string | null> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          if (!result) {
            resolve(null);
            return;
          }

          const now = Date.now();
          if (now - result.timestamp > maxAge) {
            // Удаляем устаревшую запись
            const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
            deleteTransaction.objectStore(STORE_NAME).delete(url);
            resolve(null);
            return;
          }

          resolve(result.data);
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Error reading from IndexedDB:', error);
      return null;
    }
  };

  const saveToCache = async (url: string, data: string): Promise<void> => {
    try {
      const db = await openDB();
      
      // Проверяем количество записей
      const countTransaction = db.transaction([STORE_NAME], 'readonly');
      const countRequest = countTransaction.objectStore(STORE_NAME).count();
      
      countRequest.onsuccess = async () => {
        const count = countRequest.result;
        
        // Если превышен лимит, удаляем старые записи
        if (count >= maxEntries) {
          const readTransaction = db.transaction([STORE_NAME], 'readonly');
          const index = readTransaction.objectStore(STORE_NAME).index('timestamp');
          const oldestRequest = index.openCursor();
          
          const toDelete: string[] = [];
          const deleteCount = Math.ceil(maxEntries * 0.25); // Удаляем 25%
          
          oldestRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor && toDelete.length < deleteCount) {
              toDelete.push(cursor.value.url);
              cursor.continue();
            } else {
              // Удаляем старые записи
              const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
              const deleteStore = deleteTransaction.objectStore(STORE_NAME);
              toDelete.forEach(url => deleteStore.delete(url));
            }
          };
        }
        
        // Сохраняем новую запись
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put({
          url,
          data,
          timestamp: Date.now()
        });
      };
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  };

  const clearCache = async (): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      transaction.objectStore(STORE_NAME).clear();
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
    }
  };

  return {
    getFromCache,
    saveToCache,
    clearCache
  };
};
