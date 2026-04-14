import { createContext, useContext, useState, useEffect } from 'react';
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

  const [prices, setPrices] = useState({});
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    localStorage.setItem('colma_collection', JSON.stringify(items));
    // Fetch missing metadata when items change
    items.forEach(async (item) => {
      if (!metadata[item.idProduct]) {
        const meta = await CardmarketService.getProductMetadata(item.idProduct);
        setMetadata(prev => ({ ...prev, [item.idProduct]: meta }));
      }
    });
  }, [items]);

  useEffect(() => {
    const savedPrices = localStorage.getItem('colma_prices');
    if (savedPrices) setPrices(JSON.parse(savedPrices));

    // Initial price fetch
    async function fetchPrices() {
      const priceData = await CardmarketService.fetchPriceGuide();
      if (priceData) {
        setPrices(priceData);
        localStorage.setItem('colma_prices', JSON.stringify(priceData));
      }
    }
    fetchPrices();
  }, []);

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

  const getTotalValue = () => {
    return items.reduce((total, item) => {
      const currentPrice = prices[item.idProduct]?.trend || 0;
      return total + currentPrice * item.quantity;
    }, 0);
  };

  const getTotalPurchaseValue = () => {
    return items.reduce((total, item) => {
      return total + (item.purchasePrice || 0) * item.quantity;
    }, 0);
  };

  const getStats = () => {
    const totalValue = getTotalValue();
    const purchaseValue = getTotalPurchaseValue();
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
        setPrices,
        setMetadata,
        addItem,
        removeItem,
        updateItem,
        getStats,
        getTotalValue
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}
