import germanProducts from '../data/germanProducts.json';

const PRICE_GUIDE_URL = 'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json';
const PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url='
];

export const CardmarketService = {
  async fetchPriceGuide() {
    for (const proxy of PROXIES) {
      try {
        const targetUrl = proxy + (proxy.includes('allorigins') ? encodeURIComponent(PRICE_GUIDE_URL) : PRICE_GUIDE_URL);
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
        continue;
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

  searchProducts(query, setFilter = '') {
    if (!query && !setFilter) return [];

    let results = germanProducts;

    if (setFilter) {
      results = results.filter(p => p.set === setFilter);
    }

    if (query && query.length >= 3) {
      const q = query.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.set.toLowerCase().includes(q)
      );
    } else if (query && query.length > 0 && !setFilter) {
      return []; // Wait for 3 chars if no set filter
    }

    return results;
  },

  searchProductsBySet(setName) {
    return germanProducts.filter(p => p.set === setName);
  },

  getProductImageUrl(idProduct) {
    return `https://static.cardmarket.com/img/products/1/${idProduct}.jpg`;
  }
};
