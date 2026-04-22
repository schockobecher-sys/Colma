import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Filter } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { CardmarketService } from '../services/CardmarketService';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All'); // All, Karte, Sealed
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
    if (filter !== 'All') {
      results = results.filter(r => r.type === filter);
    }

    // Group by set
    const groups = {};
    results.forEach(item => {
      if (!groups[item.set]) groups[item.set] = [];
      groups[item.set].push(item);
    });

    return groups;
  }, [debouncedSearch, filter]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
    showToast(`${product.name} hinzugefügt`);
  };

  const groupNames = Object.keys(searchResults).sort();

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
        </div>

        <div className="filter-chips" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['All', 'Karte', 'Sealed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                background: filter === f ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: filter === f ? '#000' : 'white',
                fontSize: '12px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                border: '1px solid var(--glass-border)'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="results-list" style={{ padding: '0 16px' }}>
        {groupNames.length > 0 ? (
          groupNames.map(setName => (
            <div key={setName} style={{ marginBottom: '24px' }}>
              <div className="section-title" style={{ fontSize: '12px', color: 'var(--accent)', borderBottom: '1px solid rgba(255,203,5,0.2)', paddingBottom: '4px' }}>
                {setName}
              </div>
              <div className="product-list">
                {searchResults[setName].map(result => (
                  <ProductListItem
                    key={result.idProduct}
                    product={result}
                    price={prices[result.idProduct]?.trend || 0}
                    onAdd={handleAdd}
                    isSearch={true}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-secondary" style={{ marginTop: '40px' }}>
             <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            {searchTerm.length > 2 ? 'Keine Ergebnisse gefunden' : 'Gib mindestens 3 Zeichen ein (z.B. Glurak, 151)'}
          </div>
        )}
      </div>
    </div>
  );
}
