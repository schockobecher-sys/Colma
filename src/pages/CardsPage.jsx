import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import germanProducts from '../data/germanProducts.json';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);
  const { addItem, prices } = useCollection();
  const { showToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const sets = useMemo(() => {
    const uniqueSets = [...new Set(germanProducts.map(p => p.set))];
    return uniqueSets.sort();
  }, []);

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    let results = [];
    if (debouncedSearch.length >= 3) {
      results = CardmarketService.searchProducts(debouncedSearch);
    } else if (selectedSet && debouncedSearch.length === 0) {
      results = germanProducts.filter(p => p.set === selectedSet);
    }

    if (selectedSet && debouncedSearch.length >= 3) {
      results = results.filter(p => p.set === selectedSet);
    }

    return results;
  }, [debouncedSearch, selectedSet]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
    showToast(`${product.name} hinzugefügt`);
  };

  return (
    <div className="search-page">
      <header className="app-header">
        <h1 className="app-title">Suche</h1>
      </header>

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '8px' }}>
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
            <button onClick={() => setSearchTerm('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}>
              <X size={18} />
            </button>
          )}
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>
      </div>

      <div className="set-filters" style={{ overflowX: 'auto', display: 'flex', gap: '8px', padding: '8px 16px 16px', scrollbarWidth: 'none' }}>
        {sets.map(set => (
          <button
            key={set}
            onClick={() => setSelectedSet(selectedSet === set ? null : set)}
            style={{
              whiteSpace: 'nowrap',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              background: selectedSet === set ? 'var(--accent)' : 'var(--bg-secondary)',
              color: selectedSet === set ? '#000' : 'var(--text-primary)',
              border: `1px solid ${selectedSet === set ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.2s ease'
            }}
          >
            {set}
          </button>
        ))}
      </div>

      <div className="results-list" style={{ padding: '0 16px' }}>
        <div className="section-title">
          {selectedSet ? `${selectedSet} Ergebnisse` : 'Ergebnisse'}
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{searchResults.length} gefunden</span>
        </div>
        <div className="product-list">
          {searchResults.length > 0 ? (
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
            <div className="text-center" style={{ marginTop: '40px' }}>
              <div className="pokeball-loader" style={{ marginBottom: '20px', animation: searchTerm.length < 3 && !selectedSet ? 'none' : 'spin 1s linear infinite' }}></div>
              <p className="text-secondary">
                {searchTerm.length > 0 && searchTerm.length < 3
                  ? 'Gib mindestens 3 Zeichen ein...'
                  : (selectedSet ? 'Keine Produkte in diesem Set gefunden.' : 'Suche nach Karten oder wähle ein Set aus.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
