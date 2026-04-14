import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CardmarketService } from '../services/CardmarketService';
import { Database } from '../services/Database';

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

  const [prices, setPrices] = useState({});
  const [metadata, setMetadata] = useState({});
  const [lastUpdate, setLastUpdate] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [syncProgress, setSyncProgress] = useState({ message: '' });

  // Load items and metadata
  useEffect(() => {
    localStorage.setItem('colma_collection', JSON.stringify(items));

    const loadMetadata = async () => {
      const newMetadata = { ...metadata };
      let changed = false;
      for (const item of items) {
        if (!newMetadata[item.idProduct]) {
          const meta = await CardmarketService.getProduct(item.idProduct);
          if (meta) {
            newMetadata[item.idProduct] = meta;
            changed = true;
          }
        }
      }
      if (changed) setMetadata(newMetadata);
    };

    loadMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const sync = useCallback(async (force = false) => {
    const lastSync = await Database.getMetadata('last_sync');
    const now = new Date().getTime();

    if (!force && lastSync && (now - new Date(lastSync).getTime() < 1000 * 60 * 60 * 24)) {
      setSyncStatus('success');
      const savedPrices = await Database.getAll('prices');
      const priceMap = {};
      savedPrices.forEach(p => {
          priceMap[p.idProduct] = p;
      });
      setPrices(priceMap);
      setLastUpdate(await Database.getMetadata('prices_updated_at'));
      return;
    }

    setSyncStatus('syncing');
    try {
      await CardmarketService.syncData((progress) => {
        setSyncProgress(progress);
      });
      setSyncStatus('success');

      const savedPrices = await Database.getAll('prices');
      const priceMap = {};
      savedPrices.forEach(p => {
          priceMap[p.idProduct] = p;
      });
      setPrices(priceMap);
      setLastUpdate(await Database.getMetadata('prices_updated_at'));
    } catch (e) {
      console.error('Sync failed:', e);
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

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

  const updateItem = (idProduct, updates) => {
    setItems(prev =>
      prev.map(item =>
        item.idProduct === idProduct ? { ...item, ...updates } : item
      )
    );
  };

  const getStats = () => {
    let totalValue = 0;
    let purchaseValue = 0;
    let itemCount = 0;

    items.forEach(item => {
      const currentPrice = prices[item.idProduct]?.trend || 0;
      totalValue += currentPrice * item.quantity;
      purchaseValue += (item.purchasePrice || 0) * item.quantity;
      itemCount += item.quantity;
    });

    const totalProfit = totalValue - purchaseValue;
    const profitPercent = purchaseValue > 0 ? (totalProfit / purchaseValue) * 100 : 0;

    return {
      totalValue,
      totalProfit,
      profitPercent,
      itemCount,
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
        syncStatus,
        syncProgress,
        sync,
        addItem,
        removeItem,
        updateItem,
        getStats
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}
