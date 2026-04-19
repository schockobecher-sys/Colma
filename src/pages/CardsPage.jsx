import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, prices } = useCollection();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResultsGrouped = useMemo(() => {
    const results = CardmarketService.searchProducts(debouncedSearch);
    const groups = {};
    results.forEach(res => {
      if (!groups[res.set]) groups[res.set] = [];
      groups[res.set].push(res);
    });
    return groups;
  }, [debouncedSearch]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();

    setToast(`${product.name} hinzugefügt`);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="search-page">
      <header className="app-header">
        <h1 className="app-title">Suche</h1>
      </header>

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '20px' }}>
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

      <div className="results-list" style={{ padding: '0 16px' }}>
        {Object.keys(searchResultsGrouped).length > 0 ? (
          Object.entries(searchResultsGrouped).map(([set, items]) => (
            <div key={set} style={{ marginBottom: '24px' }}>
              <div className="section-title">{set}</div>
              <div className="product-list">
                {items.map(result => (
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
            {searchTerm.length > 2 ? (
              <div className="glass-panel" style={{ padding: '40px 20px' }}>
                <Search size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>Keine Ergebnisse für "{searchTerm}"</p>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '40px 20px' }}>
                <p>Gib mindestens 3 Zeichen ein<br/><span style={{ fontSize: '12px' }}>(z.B. Glurak, 151, Obsidian)</span></p>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--accent)',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '50px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <Check size={18} /> {toast}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
