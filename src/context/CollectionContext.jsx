import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CardmarketService } from '../services/CardmarketService';

const CollectionContext = createContext();

export function useCollection() {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
}

export function CollectionProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('colma_collection');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('colma_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [prices, setPrices] = useState(() => {
    const savedPrices = localStorage.getItem('colma_prices');
    return savedPrices ? JSON.parse(savedPrices) : {};
  });

  const [metadata, setMetadata] = useState({});
  const [lastUpdate, setLastUpdate] = useState(localStorage.getItem('colma_last_update') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('colma_collection', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('colma_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Optimized Metadata Fetching for both Collection and Wishlist
  useEffect(() => {
    const fetchMetadata = async () => {
      const allIds = Array.from(new Set([
        ...items.map(i => i.idProduct),
        ...wishlist
      ]));

      const missingIds = allIds.filter(id => !metadata[id]);

      if (missingIds.length === 0) return;

      const newMetadata = { ...metadata };
      let changed = false;

      for (const id of missingIds) {
        const meta = await CardmarketService.getProductMetadata(id);
        newMetadata[id] = meta;
        changed = true;
      }

      if (changed) {
        setMetadata(newMetadata);
      }
    };
    fetchMetadata();
  }, [items, wishlist, metadata]);

  const fetchPrices = useCallback(async (force = false) => {
    const now = new Date().getTime();
    const lastFetch = localStorage.getItem('colma_last_fetch_time');

    if (!force && lastFetch && now - Number(lastFetch) < 1000 * 60 * 30) {
      console.log('Using cached prices (less than 30 minutes old)');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await CardmarketService.fetchPriceGuide();
      if (result) {
        setPrices(result.prices);
        setLastUpdate(result.updatedAt);
        localStorage.setItem('colma_prices', JSON.stringify(result.prices));
        localStorage.setItem('colma_last_update', result.updatedAt);
        localStorage.setItem('colma_last_fetch_time', now.toString());
      }
    } catch (e) {
      console.error('Failed to update prices:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const addItem = (productOrId, quantity = 1, purchasePrice = 0) => {
    const idProduct = typeof productOrId === 'object' ? productOrId.idProduct : productOrId;

    setItems(prev => {
      const existing = prev.find(item => item.idProduct === idProduct);
      if (existing) {
        return prev.map(item =>
          item.idProduct === idProduct
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        idProduct,
        quantity,
        purchasePrice: purchasePrice || 0,
        dateAdded: new Date().toISOString()
      }];
    });
  };

  const updateQuantity = (idProduct, delta) => {
    setItems(prev =>
      prev.map(item =>
        item.idProduct === idProduct
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (idProduct) => {
    setItems(prev => prev.filter(item => item.idProduct !== idProduct));
  };

  const updateItem = (idProduct, updates) => {
    setItems(prev =>
      prev.map(item =>
        item.idProduct === idProduct ? { ...item, ...updates } : item
      )
    );
  };

  const toggleWishlist = (idProduct) => {
    setWishlist(prev =>
      prev.includes(idProduct)
        ? prev.filter(id => id !== idProduct)
        : [...prev, idProduct]
    );
  };

  const getStats = () => {
    const totalValue = items.reduce((total, item) => {
      const currentPrice = prices[item.idProduct]?.trend || 0;
      return total + currentPrice * item.quantity;
    }, 0);

    const purchaseValue = items.reduce((total, item) => {
      return total + (item.purchasePrice || 0) * item.quantity;
    }, 0);

    const totalProfit = totalValue - purchaseValue;
    const profitPercent = purchaseValue > 0 ? (totalProfit / purchaseValue) * 100 : 0;

    return {
      totalValue,
      totalProfit,
      profitPercent,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      uniqueCount: items.length
    };
  };

  return (
    <CollectionContext.Provider
      value={{
        items,
        wishlist,
        prices,
        metadata,
        lastUpdate,
        isSyncing,
        fetchPrices,
        addItem,
        removeItem,
        updateItem,
        updateQuantity,
        toggleWishlist,
        getStats
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}
