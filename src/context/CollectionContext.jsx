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

  const [prices, setPrices] = useState(() => {
    const savedPrices = localStorage.getItem('colma_prices');
    return savedPrices ? JSON.parse(savedPrices) : {};
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('colma_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [metadata, setMetadata] = useState({});
  const [lastUpdate, setLastUpdate] = useState(localStorage.getItem('colma_last_update') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem('colma_collection', JSON.stringify(items));
    items.forEach(async (item) => {
      if (!metadata[item.idProduct]) {
        const meta = await CardmarketService.getProductMetadata(item.idProduct);
        setMetadata(prev => ({ ...prev, [item.idProduct]: meta }));
      }
    });
  }, [items]);

  useEffect(() => {
    localStorage.setItem('colma_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

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

  const addItem = (idProduct, quantity = 1, purchasePrice = 0) => {
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
        purchasePrice,
        dateAdded: new Date().toISOString()
      }];
    });
  };

  const removeItem = (idProduct) => {
    setItems(prev => prev.filter(item => item.idProduct !== idProduct));
  };

  const updateQuantity = (idProduct, delta) => {
    setItems(prev => prev.map(item =>
      item.idProduct === idProduct
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const updatePurchasePrice = (idProduct, newPrice) => {
    setItems(prev => prev.map(item =>
      item.idProduct === idProduct
        ? { ...item, purchasePrice: Number(newPrice) }
        : item
    ));
  };

  const toggleWishlist = (idProduct) => {
    setWishlist(prev =>
      prev.includes(idProduct)
        ? prev.filter(id => id !== idProduct)
        : [...prev, idProduct]
    );
  };

  const isInWishlist = (idProduct) => wishlist.includes(idProduct);

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
        prices,
        metadata,
        lastUpdate,
        isSyncing,
        wishlist,
        setPrices,
        setMetadata,
        addItem,
        removeItem,
        updateQuantity,
        updatePurchasePrice,
        toggleWishlist,
        isInWishlist,
        getStats,
        fetchPrices
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}
