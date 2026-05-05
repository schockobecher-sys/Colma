import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

const POPULAR_SETS = ['151', 'Obsidianflammen', 'Gewalten der Zeit', 'Karmesin & Purpur', 'Promos'];

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);
  const { addItem, prices } = useCollection();
  const { showToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
      // If we have a set selected, we might want to filter the results or even show all from that set
      // The current searchProducts only works with query. Let's adapt it.
      if (debouncedSearch.length < 3) {
        // Special case: if query is empty but set is selected, show all from set
        results = CardmarketService.searchProductsBySet(selectedSet);
      } else {
        results = results.filter(p => p.set === selectedSet);
      }
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

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div className="search-input-wrapper" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Search size={20} className="text-secondary" />
          <input
            type="text"
            placeholder="Karten oder Produkte suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '16px' }}
          />
          {searchTerm && <X size={18} className="text-secondary" onClick={() => setSearchTerm('')} style={{ cursor: 'pointer' }} />}
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>

        <div className="set-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {POPULAR_SETS.map(set => (
            <button
              key={set}
              onClick={() => setSelectedSet(selectedSet === set ? null : set)}
              className={`filter-chip ${selectedSet === set ? 'active' : ''}`}
              style={{
                background: selectedSet === set ? 'var(--accent)' : 'var(--bg-secondary)',
                color: selectedSet === set ? '#000' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                whiteSpace: 'nowrap'
              }}
            >
              {set}
            </button>
          ))}
        </div>
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
                isSearch={true}
              />
            ))
          ) : (
            <div className="text-center text-secondary" style={{ marginTop: '40px', padding: '40px 20px' }}>
              {(searchTerm.length > 2 || selectedSet) ? (
                <>
                  <div className="pokeball-loader" style={{ animation: 'none', opacity: 0.5 }}></div>
                  <p>Keine Ergebnisse gefunden</p>
                </>
              ) : (
                <>
                  <div className="pokeball-loader" style={{ animation: 'none', opacity: 0.2 }}></div>
                  <p>Gib mindestens 3 Zeichen ein (z.B. Glurak, 151) oder wähle ein Set oben aus.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
