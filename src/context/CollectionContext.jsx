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

  const [metadata, setMetadata] = useState(() => {
    const savedMeta = localStorage.getItem('colma_metadata');
    return savedMeta ? JSON.parse(savedMeta) : {};
  });

  const [lastUpdate, setLastUpdate] = useState(localStorage.getItem('colma_last_update') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem('colma_collection', JSON.stringify(items));

    const updateMetadata = async () => {
      let changed = false;
      const newMeta = { ...metadata };

      for (const item of items) {
        if (!newMeta[item.idProduct]) {
          const meta = await CardmarketService.getProductMetadata(item.idProduct);
          newMeta[item.idProduct] = meta;
          changed = true;
        }
      }

      if (changed) {
        setMetadata(newMeta);
        localStorage.setItem('colma_metadata', JSON.stringify(newMeta));
      }
    };

    updateMetadata();
  }, [items, metadata]);

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
      const id = Number(idProduct);
      const existing = prev.find(item => item.idProduct === id);
      if (existing) {
        return prev.map(item =>
          item.idProduct === id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        idProduct: id,
        quantity,
        purchasePrice,
        dateAdded: new Date().toISOString()
      }];
    });
  };

  const updateQuantity = (idProduct, delta) => {
    setItems(prev => {
      const id = Number(idProduct);
      return prev.map(item => {
        if (item.idProduct === id) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeItem = (idProduct) => {
    const id = Number(idProduct);
    setItems(prev => prev.filter(item => item.idProduct !== id));
  };

  const updateItem = (idProduct, updates) => {
    const id = Number(idProduct);
    setItems(prev =>
      prev.map(item =>
        item.idProduct === id ? { ...item, ...updates } : item
      )
    );
  };

  const getStats = () => {
    const totalValue = items.reduce((total, item) => {
      const currentPrice = prices[item.idProduct]?.trend || 0;
      return total + currentPrice * item.quantity;
    }, 0);

    const totalPurchaseValue = items.reduce((total, item) => {
      return total + (item.purchasePrice || 0) * item.quantity;
    }, 0);

    const totalProfit = totalValue - totalPurchaseValue;
    const profitPercent = totalPurchaseValue > 0 ? (totalProfit / totalPurchaseValue) * 100 : 0;

    return {
      totalValue,
      totalPurchaseValue,
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
        fetchPrices,
        addItem,
        updateQuantity,
        removeItem,
        updateItem,
        getStats
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}
