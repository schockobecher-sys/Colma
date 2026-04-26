import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, prices } = useCollection();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResultsBySet = useMemo(() => {
    const results = CardmarketService.searchProducts(debouncedSearch);
    const grouped = {};
    results.forEach(product => {
      if (!grouped[product.set]) grouped[product.set] = [];
      grouped[product.set].push(product);
    });
    return grouped;
  }, [debouncedSearch]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
    // Use a non-blocking notification instead of alert for better UX
    console.log(`${product.name} hinzugefügt`);
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
        {Object.keys(searchResultsBySet).length > 0 ? (
          Object.entries(searchResultsBySet).map(([set, products]) => (
            <div key={set} style={{ marginBottom: '24px' }}>
              <div className="section-title" style={{ fontSize: '14px', opacity: 0.8 }}>{set}</div>
              <div className="product-list">
                {products.map(product => (
                  <ProductListItem
                    key={product.idProduct}
                    product={product}
                    price={prices[product.idProduct]?.trend || 0}
                    onAdd={handleAdd}
                    isSearch={true}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-secondary" style={{ marginTop: '40px' }}>
            <div className="glass-panel" style={{ padding: '40px 20px', borderRadius: '24px' }}>
              <Search size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p>{searchTerm.length > 2 ? 'Keine Ergebnisse gefunden' : 'Gib mindestens 3 Zeichen ein (z.B. Glurak, 151)'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
