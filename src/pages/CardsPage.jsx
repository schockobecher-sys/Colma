import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, prices, toggleWishlist, wishlist } = useCollection();
  const { showToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);

  // Example sets for quick filtering
  const popularSets = ['151', 'Obsidianflammen', 'Gewalten der Zeit', 'Karmesin & Purpur'];

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    let results = CardmarketService.searchProducts(debouncedSearch);
    if (selectedSet) {
      results = results.filter(p => p.set === selectedSet);
    }
    return results;
  }, [debouncedSearch, selectedSet]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
    showToast(`${product.name} hinzugefügt`, 'success');
  };

  return (
    <div className="search-page">
      <header className="app-header">
        <h1 className="app-title">Suche</h1>
      </header>

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '12px' }}>
        <div className="search-input-wrapper" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} className="text-secondary" />
          <input
            type="text"
            placeholder="Glurak, Pikachu, 151..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '16px' }}
          />
          {searchTerm && <X size={18} className="text-secondary" onClick={() => setSearchTerm('')} style={{ cursor: 'pointer' }} />}
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>
      </div>

      <div className="sets-filter" style={{ padding: '0 16px', marginBottom: '24px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {popularSets.map(setName => (
          <button
            key={setName}
            className={`filter-chip ${selectedSet === setName ? 'active' : ''}`}
            onClick={() => setSelectedSet(selectedSet === setName ? null : setName)}
          >
            {setName}
          </button>
        ))}
      </div>

      <div className="results-list" style={{ padding: '0 16px' }}>
        <div className="section-title">
          {searchResults.length} Ergebnisse
        </div>
        <div className="product-list">
          {searchResults.length > 0 ? (
            searchResults.map(result => (
              <ProductListItem
                key={result.idProduct}
                product={result}
                price={prices[result.idProduct]?.trend || 0}
                onAdd={handleAdd}
                onToggleWishlist={toggleWishlist}
                wishlist={wishlist}
                isSearch={true}
              />
            ))
          ) : (
            <div className="text-center text-secondary glass-panel" style={{ marginTop: '40px', padding: '40px 20px' }}>
              <Search size={40} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <div>
                {searchTerm.length > 2
                  ? 'Keine Ergebnisse gefunden'
                  : 'Suche nach deinen Lieblingskarten (min. 3 Zeichen)'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
