import { createContext, useContext, useState, useEffect } from 'react';

const CollectionContext = createContext();

export function useCollection() {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
}

export function CollectionProvider({ children }) {
  const [collection, setCollection] = useState(() => {
    const saved = localStorage.getItem('pokemonCollection');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('pokemonFavorites');
    return saved ? JSON.parse(saved) : { cards: [], sets: [] };
  });

  useEffect(() => {
    localStorage.setItem('pokemonCollection', JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToCollection = (cardId, quantity = 1, condition = 'Near Mint') => {
    setCollection(prev => {
      const existing = prev.find(item => item.cardId === cardId);
      if (existing) {
        return prev.map(item =>
          item.cardId === cardId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { cardId, quantity, condition, dateAdded: new Date().toISOString() }];
    });
  };

  const removeFromCollection = (cardId) => {
    setCollection(prev => prev.filter(item => item.cardId !== cardId));
  };

  const updateCollectionItem = (cardId, updates) => {
    setCollection(prev =>
      prev.map(item =>
        item.cardId === cardId ? { ...item, ...updates } : item
      )
    );
  };

  const toggleFavoriteCard = (cardId) => {
    setFavorites(prev => {
      const isFavorite = prev.cards.includes(cardId);
      return {
        ...prev,
        cards: isFavorite
          ? prev.cards.filter(id => id !== cardId)
          : [...prev.cards, cardId]
      };
    });
  };

  const toggleFavoriteSet = (setId) => {
    setFavorites(prev => {
      const isFavorite = prev.sets.includes(setId);
      return {
        ...prev,
        sets: isFavorite
          ? prev.sets.filter(id => id !== setId)
          : [...prev.sets, setId]
      };
    });
  };

  const getCollectionValue = (cards) => {
    return collection.reduce((total, item) => {
      const card = cards.find(c => c.id === item.cardId);
      return total + (card?.prices?.market || 0) * item.quantity;
    }, 0);
  };

  const getCollectionStats = () => {
    return {
      totalCards: collection.reduce((sum, item) => sum + item.quantity, 0),
      uniqueCards: collection.length,
      totalValue: 0, // Will be calculated when cards are available
      favoriteCards: favorites.cards.length,
      favoriteSets: favorites.sets.length
    };
  };

  const isInCollection = (cardId) => {
    return collection.some(item => item.cardId === cardId);
  };

  const isFavoriteCard = (cardId) => {
    return favorites.cards.includes(cardId);
  };

  const isFavoriteSet = (setId) => {
    return favorites.sets.includes(setId);
  };

  return (
    <CollectionContext.Provider
      value={{
        collection,
        favorites,
        addToCollection,
        removeFromCollection,
        updateCollectionItem,
        toggleFavoriteCard,
        toggleFavoriteSet,
        getCollectionValue,
        getCollectionStats,
        isInCollection,
        isFavoriteCard,
        isFavoriteSet
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}
