import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSet, setActiveSet] = useState(null);
  const { addItem, prices, wishlist, toggleWishlist } = useCollection();
  const { addToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const sets = ['151', 'Obsidianflammen', 'Gewalten der Zeit', 'Karmesin & Purpur', 'Entfesseltes Karma', 'Promos'];

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    return CardmarketService.searchProducts(debouncedSearch, activeSet);
  }, [debouncedSearch, activeSet]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
    addToast(`${product.name} hinzugefügt`);
  };

  return (
    <div className="search-page">
      <header className="app-header">
        <h1 className="app-title">Suche</h1>
      </header>

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div className="search-input-wrapper" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Search size={20} className="text-secondary" />
          <input
            type="text"
            placeholder="Produkte suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '16px' }}
          />
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>

        <div className="sets-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {sets.map(set => (
            <button
              key={set}
              onClick={() => setActiveSet(activeSet === set ? null : set)}
              className={`filter-chip ${activeSet === set ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: activeSet === set ? 'var(--accent)' : 'var(--bg-secondary)',
                color: activeSet === set ? 'black' : 'white',
                border: '1px solid var(--border)',
                whiteSpace: 'nowrap',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {set}
            </button>
          ))}
        </div>
      </div>

      <div className="results-list" style={{ padding: '0 16px' }}>
        <div className="section-title">Ergebnisse ({searchResults.length})</div>
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
            <div className="text-center text-secondary" style={{ marginTop: '40px' }}>
              {searchTerm.length > 2 || activeSet ? 'Keine Ergebnisse gefunden' : 'Wähle ein Set oder gib mindestens 3 Zeichen ein.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
