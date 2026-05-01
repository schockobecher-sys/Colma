import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { useToast } from '../context/ToastContext';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [setFilter, setSetFilter] = useState(null);
  const { addItem, prices } = useCollection();
  const { showToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const sets = useMemo(() => {
    const uniqueSets = [...new Set(CardmarketService.searchProducts('', null).map(p => p.set))];
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
    return CardmarketService.searchProducts(debouncedSearch, setFilter);
  }, [debouncedSearch, setFilter]);

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
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '800' }}>X</button>
          )}
        </div>

        <div className="set-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSetFilter(null)}
            className={`glass-panel ${setFilter === null ? 'active-filter' : ''}`}
            style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', border: setFilter === null ? '1px solid var(--accent)' : '1px solid var(--glass-border)', background: setFilter === null ? 'rgba(255, 203, 5, 0.1)' : 'var(--glass-bg)', color: setFilter === null ? 'var(--accent)' : 'white' }}
          >
            Alle Sets
          </button>
          {sets.map(set => (
            <button
              key={set}
              onClick={() => setSetFilter(setFilter === set ? null : set)}
              className={`glass-panel ${setFilter === set ? 'active-filter' : ''}`}
              style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', border: setFilter === set ? '1px solid var(--accent)' : '1px solid var(--glass-border)', background: setFilter === set ? 'rgba(255, 203, 5, 0.1)' : 'var(--glass-bg)', color: setFilter === set ? 'var(--accent)' : 'white' }}
            >
              {set}
            </button>
          ))}
        </div>
      </div>

      <div className="results-list" style={{ padding: '0 16px' }}>
        <div className="section-title">Ergebnisse</div>
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
            <div className="text-center text-secondary glass-panel" style={{ marginTop: '40px', padding: '40px 20px' }}>
               <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
              {searchTerm.length > 0 && searchTerm.length < 3 ? (
                 <p>Suche verfeinern (min. 3 Zeichen)...</p>
              ) : searchTerm.length >= 3 || setFilter ? (
                <p>Keine Produkte gefunden. Probiere einen anderen Suchbegriff.</p>
              ) : (
                <p>Gib einen Suchbegriff ein oder wähle ein Set aus, um die Datenbank zu durchsuchen.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
