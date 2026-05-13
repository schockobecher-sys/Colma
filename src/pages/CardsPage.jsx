import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);
  const { addItem, prices, toggleWishlist, wishlist } = useCollection();
  const { addToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    // Basic search logic
    let results = CardmarketService.searchProducts(debouncedSearch);

    // If we have a set selected, filter or fetch set items
    if (selectedSet) {
        // If search term is empty, show all items from that set
        if (!debouncedSearch) {
             results = CardmarketService.searchProductsBySet ? CardmarketService.searchProductsBySet(selectedSet) : [];
        } else {
             results = results.filter(p => p.set === selectedSet);
        }
    }

    return results;
  }, [debouncedSearch, selectedSet]);

  const sets = useMemo(() => {
    // Extract unique sets from the full list
    const allProducts = CardmarketService.searchProducts('');
    const uniqueSets = [...new Set(allProducts.map(p => p.set))];
    return uniqueSets.sort();
  }, []);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product, 1, price);
    FeedbackService.triggerAdd();
    addToast(`${product.name} zur Sammlung hinzugefügt`);
  };

  const handleToggleWishlist = (idProduct) => {
    toggleWishlist(idProduct);
    FeedbackService.triggerAdd();
  };

  return (
    <div className="search-page">
      <header className="app-header">
        <h1 className="app-title">Suche</h1>
      </header>

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '10px' }}>
        <div className="search-input-wrapper" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} className="text-secondary" />
          <input
            type="text"
            placeholder="Karten oder Produkte suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '16px' }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                <X size={18} />
            </button>
          )}
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>
      </div>

      <div className="set-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 16px', scrollbarWidth: 'none' }}>
        {sets.map(setName => (
          <button
            key={setName}
            onClick={() => setSelectedSet(selectedSet === setName ? null : setName)}
            className={`filter-chip ${selectedSet === setName ? 'active' : ''}`}
            style={{ fontSize: '10px' }}
          >
            {setName}
          </button>
        ))}
      </div>

      <div className="results-list" style={{ padding: '0 16px' }}>
        <div className="section-title">
            {selectedSet ? `${selectedSet} Ergebnisse` : 'Ergebnisse'}
        </div>
        <div className="product-list">
          {searchResults.length > 0 ? (
            searchResults.map(result => (
              <ProductListItem
                key={result.idProduct}
                product={result}
                price={prices[result.idProduct]?.trend || 0}
                onAdd={handleAdd}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
                isSearch={true}
              />
            ))
          ) : (
            <div className="text-center text-secondary glass-panel" style={{ marginTop: '40px', padding: '40px' }}>
              {searchTerm.length > 2 || selectedSet ? (
                <>
                   <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
                   <p>Keine Ergebnisse gefunden</p>
                </>
              ) : (
                <>
                   <div className="pokeball-loader"></div>
                   <p style={{ fontSize: '14px' }}>Gib mindestens 3 Zeichen ein oder wähle ein Set aus.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
