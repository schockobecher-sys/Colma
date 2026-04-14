import { Database } from './Database';

const PRICE_GUIDE_URL = 'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json';
const PRODUCTS_SINGLES_URL = 'https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_6.json';
const PRODUCTS_NONSINGLES_URL = 'https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_6.json';

const PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url='
];

export const CardmarketService = {
  async fetchWithTimeout(url, timeout = 30000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  },

  async fetchFromProxy(url) {
    for (const proxy of PROXIES) {
      try {
        const targetUrl = proxy + (proxy.includes('allorigins') ? encodeURIComponent(url) : url);
        console.log(`Trying proxy ${proxy} for ${url}`);
        return await this.fetchWithTimeout(targetUrl);
      } catch (error) {
        console.warn(`Proxy ${proxy} failed for ${url}:`, error.message);
      }
    }
    throw new Error(`Failed to fetch ${url} from all proxies`);
  },

  async syncData(onProgress) {
    onProgress?.({ stage: 'prices', message: 'Lade Preise...' });
    const priceData = await this.fetchFromProxy(PRICE_GUIDE_URL);
    await Database.putAll('prices', priceData.priceGuides.map(p => ({
      idProduct: p.idProduct,
      avg: p.avg,
      low: p.low,
      trend: p.trend
    })));
    await Database.setMetadata('prices_updated_at', priceData.createdAt);

    onProgress?.({ stage: 'singles', message: 'Lade Karten...' });
    const singlesData = await this.fetchFromProxy(PRODUCTS_SINGLES_URL);
    await Database.putAll('products', singlesData.products);

    onProgress?.({ stage: 'nonsingles', message: 'Lade Produkte...' });
    const nonSinglesData = await this.fetchFromProxy(PRODUCTS_NONSINGLES_URL);

    // Non-singles are usually fewer, but let's use the same batched put for consistency
    const putDb = await Database.init();
    const batchSize = 1000;
    for (let i = 0; i < nonSinglesData.products.length; i += batchSize) {
        const batch = nonSinglesData.products.slice(i, i + batchSize);
        await new Promise((resolve, reject) => {
            const transaction = putDb.transaction('products', 'readwrite');
            const store = transaction.objectStore('products');
            batch.forEach(p => store.put(p));
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    await Database.setMetadata('last_sync', new Date().toISOString());
  },

  async getPrice(idProduct) {
    return await Database.get('prices', idProduct);
  },

  async getProduct(idProduct) {
    const product = await Database.get('products', idProduct);
    if (product) {
        return {
            ...product,
            image: `https://static.cardmarket.com/img/products/1/${idProduct}.jpg`,
            set: product.categoryName
        };
    }
    return null;
  },

  async searchProducts(query) {
    if (!query || query.length < 3) return [];
    return await Database.searchProducts(query);
  }
};
