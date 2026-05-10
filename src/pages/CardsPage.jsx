import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [setFilter, setSetFilter] = useState('Alle');
  const { addItem, prices } = useCollection();
  const { showToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const sets = ['Alle', '151', 'Obsidianflammen', 'Gewalten der Zeit', 'Karmesin & Purpur'];

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    let results = CardmarketService.searchProducts(debouncedSearch);
    if (setFilter !== 'Alle') {
      results = results.filter(p => p.set === setFilter);
    }
    return results;
  }, [debouncedSearch, setFilter]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
    showToast(`${product.name} zur Sammlung hinzugefügt`);
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
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>
      </div>

      <div className="set-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 20px', scrollbarWidth: 'none' }}>
        {sets.map(s => (
          <button
            key={s}
            onClick={() => setSetFilter(s)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              fontSize: '12px',
              fontWeight: '700',
              background: setFilter === s ? 'var(--accent)' : 'var(--bg-secondary)',
              color: setFilter === s ? '#000' : 'var(--text-secondary)',
              border: '1px solid var(--border)'
            }}
          >
            {s}
          </button>
        ))}
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
                isSearch={true}
              />
            ))
          ) : (
            <div className="text-center text-secondary" style={{ marginTop: '40px' }}>
              {searchTerm.length > 2 ? 'Keine Ergebnisse gefunden' : 'Gib mindestens 3 Zeichen ein (z.B. Glurak, 151)'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
