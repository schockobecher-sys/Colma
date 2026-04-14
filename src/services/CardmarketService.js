import { Database } from './Database';

const PRICE_GUIDE_URL = 'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json';
const PRODUCTS_SINGLES_URL = 'https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_6.json';
const PRODUCTS_NONSINGLES_URL = 'https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_6.json';

const PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url='
];

export const CardmarketService = {
  async fetchFromProxy(url) {
    for (const proxy of PROXIES) {
      try {
        const targetUrl = proxy + (proxy.includes('allorigins') ? encodeURIComponent(url) : url);
        const response = await fetch(targetUrl);
        if (!response.ok) continue;
        const data = await response.json();
        return data;
      } catch (error) {
        console.warn(`Proxy ${proxy} failed for ${url}:`, error);
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

    const db = await Database.init();
    const transaction = db.transaction('products', 'readwrite');
    const store = transaction.objectStore('products');
    nonSinglesData.products.forEach(p => store.put(p));

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
