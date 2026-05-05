import germanProducts from '../data/germanProducts.json';

const PRICE_GUIDE_URL = 'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json';
// Primary and secondary CORS proxies for reliability
const PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url='
];

export const CardmarketService = {
  /**
   * Fetches real prices from Cardmarket S3 via a CORS proxy.
   * No simulation/fallback data used.
   */
  async fetchPriceGuide() {
    for (const proxy of PROXIES) {
      try {
        const targetUrl = proxy + (proxy.includes('allorigins') ? encodeURIComponent(PRICE_GUIDE_URL) : PRICE_GUIDE_URL);
        console.log(`Fetching prices via ${proxy}...`);

        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error(`Proxy ${proxy} failed`);

        const data = await response.json();
        if (!data || !data.priceGuides) throw new Error('Invalid data format');

        return {
          prices: this._transformPrices(data.priceGuides),
          updatedAt: data.createdAt
        };
      } catch (error) {
        console.warn(`Attempt with ${proxy} failed:`, error.message);
        continue; // Try next proxy
      }
    }
    throw new Error('All CORS proxies failed to fetch Cardmarket data.');
  },

  _transformPrices(priceGuides) {
    const priceMap = {};
    priceGuides.forEach(guide => {
      priceMap[guide.idProduct] = {
        avg: guide.avg,
        low: guide.low,
        trend: guide.trend
      };
    });
    return priceMap;
  },

  /**
   * Uses the local curated German database for metadata.
   */
  async getProductMetadata(idProduct) {
    const product = germanProducts.find(p => p.idProduct === Number(idProduct));
    return product || {
      idProduct: Number(idProduct),
      name: `Produkt #${idProduct}`,
      set: 'Unbekannt',
      image: '❓',
      type: 'Unbekannt'
    };
  },

  /**
   * Local search against curated products.
   */
  searchProducts(query) {
    if (!query || query.length < 3) return [];
    const q = query.toLowerCase();
    return germanProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.set.toLowerCase().includes(q)
    );
  },

  /**
   * Search by set name specifically.
   */
  searchProductsBySet(setName) {
    if (!setName) return [];
    return germanProducts.filter(p => p.set === setName);
  },

  /**
   * Helper to get the Cardmarket image URL
   */
  getProductImageUrl(idProduct) {
    return `https://static.cardmarket.com/img/products/1/${idProduct}.jpg`;
  }
};
