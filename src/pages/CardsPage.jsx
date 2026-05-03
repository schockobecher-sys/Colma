import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { SETS } from '../data/constants';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);
  const { addItem, prices } = useCollection();
  const { showToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedSet]);

  const searchResults = useMemo(() => {
    return CardmarketService.searchProducts(debouncedSearch, selectedSet);
  }, [debouncedSearch, selectedSet]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
    showToast(`${product.name} hinzugefügt`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value !== debouncedSearch) {
      setIsLoading(true);
    }
  };

  const handleSetSelect = (setName) => {
    setSelectedSet(setName);
    setIsLoading(true);
  };

  return (
    <div className="search-page">
      <header className="app-header">
        <h1 className="app-title">Suche</h1>
      </header>

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '16px' }}>
        <div className="search-input-wrapper" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} className="text-secondary" />
          <input
            type="text"
            placeholder="Karten oder Produkte suchen..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '16px' }}
          />
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>
      </div>

      <div className="set-filters" style={{ padding: '0 16px', marginBottom: '24px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', gap: '8px', scrollbarWidth: 'none' }}>
        <button
          onClick={() => handleSetSelect(null)}
          className={`glass-panel ${!selectedSet ? 'text-accent' : ''}`}
          style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', border: !selectedSet ? '1px solid var(--accent)' : '1px solid var(--glass-border)' }}
        >
          Alle Sets
        </button>
        {SETS.map(setName => (
          <button
            key={setName}
            onClick={() => handleSetSelect(setName)}
            className={`glass-panel ${selectedSet === setName ? 'text-accent' : ''}`}
            style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', border: selectedSet === setName ? '1px solid var(--accent)' : '1px solid var(--glass-border)' }}
          >
            {setName}
          </button>
        ))}
      </div>

      <div className="results-list" style={{ padding: '0 16px' }}>
        <div className="section-title">Ergebnisse</div>
        <div className="product-list">
          {isLoading ? (
            <div className="pokeball-loader"></div>
          ) : searchResults.length > 0 ? (
            searchResults.map(result => (
              <ProductListItem
                key={result.idProduct}
                product={result}
                price={prices[result.idProduct]?.trend || 0}
                onAdd={handleAdd}
                isSearch={true}
              />
            ))
          ) : (
            <div className="text-center text-secondary glass-panel" style={{ marginTop: '20px', padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
              {searchTerm.length > 2 || selectedSet ? 'Keine Ergebnisse gefunden' : 'Gib mindestens 3 Zeichen ein oder wähle ein Set'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
