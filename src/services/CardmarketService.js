import { Database } from './Database';
import pokemonNamesData from '../data/pokemonNames.json';

const PRICE_GUIDE_URL = 'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json';
const PRODUCTS_SINGLES_URL = 'https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_6.json';
const PRODUCTS_NONSINGLES_URL = 'https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_6.json';

const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest='
];

const POKEMON_CATEGORIES = [51, 52, 53, 54, 55, 56, 57, 58, 59, 60]; // Pokemon related categories

// Pre-compile regexes for performance
const LOCALIZATION_PAIRS = Object.keys(pokemonNamesData)
  .sort((a, b) => b.length - a.length)
  .map(enName => ({
    regex: new RegExp(`\\b${enName}\\b`, 'gi'),
    deName: pokemonNamesData[enName]
  }));

const TERM_REPLACEMENTS = [
  { regex: /Booster Box/g, replacement: 'Display' },
  { regex: /Booster Pack/g, replacement: 'Booster' },
  { regex: /Theme Deck/g, replacement: 'Themendeck' },
  { regex: /Checklane Blister/g, replacement: 'Blister' },
  { regex: /3-Pack Blister/g, replacement: '3er Blister' }
];

export const CardmarketService = {
  localizeName(name) {
    if (!name) return name;
    let localizedName = name;

    for (const pair of LOCALIZATION_PAIRS) {
      if (pair.regex.test(localizedName)) {
        localizedName = localizedName.replace(pair.regex, pair.deName);
      }
    }

    for (const rep of TERM_REPLACEMENTS) {
      localizedName = localizedName.replace(rep.regex, rep.replacement);
    }

    return localizedName;
  },

  async fetchWithTimeout(url, timeout = 60000) {
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
    onProgress?.({ stage: 'prices', message: 'Lade Cardmarket Preise...' });
    const priceData = await this.fetchFromProxy(PRICE_GUIDE_URL);

    // Map only prices for products we actually care about or just store all?
    // Storing all is easier since we don't have the product list yet.
    await Database.putAll('prices', priceData.priceGuides.map(p => ({
      idProduct: p.idProduct,
      avg: p.avg,
      low: p.low,
      trend: p.trend,
      avg1: p.avg1,
      avg7: p.avg7,
      avg30: p.avg30
    })));
    await Database.setMetadata('prices_updated_at', priceData.createdAt);

    onProgress?.({ stage: 'singles', message: 'Lade Pokémon Karten (DE)...' });
    const singlesData = await this.fetchFromProxy(PRODUCTS_SINGLES_URL);
    const pokemonSingles = singlesData.products
        .filter(p => p.idCategory === 51)
        .map(p => ({
            ...p,
            name: this.localizeName(p.name)
        }));
    await Database.putAll('products', pokemonSingles);

    onProgress?.({ stage: 'nonsingles', message: 'Lade Sealed Produkte (DE)...' });
    const nonSinglesData = await this.fetchFromProxy(PRODUCTS_NONSINGLES_URL);
    const pokemonSealed = nonSinglesData.products
        .filter(p => POKEMON_CATEGORIES.includes(p.idCategory) && p.idCategory !== 51)
        .map(p => ({
            ...p,
            name: this.localizeName(p.name)
        }));

    // Add sealed to the same product store
    const putDb = await Database.init();
    const batchSize = 1000;
    for (let i = 0; i < pokemonSealed.length; i += batchSize) {
        const batch = pokemonSealed.slice(i, i + batchSize);
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
