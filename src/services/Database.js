const DB_NAME = 'ColmaDB';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_PRICES = 'prices';
const STORE_METADATA = 'metadata';

export const Database = {
  db: null,

  async init() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        const upgradeDb = event.target.result;
        if (!upgradeDb.objectStoreNames.contains(STORE_PRODUCTS)) {
          const productStore = upgradeDb.createObjectStore(STORE_PRODUCTS, { keyPath: 'idProduct' });
          productStore.createIndex('name', 'name', { unique: false });
          productStore.createIndex('categoryName', 'categoryName', { unique: false });
        }
        if (!upgradeDb.objectStoreNames.contains(STORE_PRICES)) {
          upgradeDb.createObjectStore(STORE_PRICES, { keyPath: 'idProduct' });
        }
        if (!upgradeDb.objectStoreNames.contains(STORE_METADATA)) {
          upgradeDb.createObjectStore(STORE_METADATA, { keyPath: 'key' });
        }
      };
    });
  },

  async putAll(storeName, items) {
    const putDb = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = putDb.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      store.clear();

      let i = 0;
      function putNext() {
        if (i < items.length) {
          const request = store.put(items[i]);
          request.onerror = () => reject(request.error);
          i++;
          if (i % 1000 === 0) {
            setTimeout(putNext, 0);
          } else {
            putNext();
          }
        } else {
          resolve();
        }
      }
      putNext();
    });
  },

  async getAll(storeName) {
    const getDb = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = getDb.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async get(storeName, key) {
    const getDb = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = getDb.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async searchProducts(query) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_PRODUCTS, 'readonly');
      const store = transaction.objectStore(STORE_PRODUCTS);
      const request = store.openCursor();
      const results = [];
      const q = query.toLowerCase();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.name.toLowerCase().includes(q)) {
            results.push(cursor.value);
          }
          if (results.length < 50) {
            cursor.continue();
          } else {
            resolve(results);
          }
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  },

  async setMetadata(key, value) {
    const setDb = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = setDb.transaction(STORE_METADATA, 'readwrite');
      const store = transaction.objectStore(STORE_METADATA);
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getMetadata(key) {
    await this.init();
    const result = await this.get(STORE_METADATA, key);
    return result ? result.value : null;
  }
};
