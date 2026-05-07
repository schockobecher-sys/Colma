import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSet, setActiveSet] = useState(null);
  const { addItem, prices } = useCollection();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const sets = ['151', 'Obsidianflammen', 'Gewalten der Zeit', 'Karmesin & Purpur', 'Promos'];

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
    // Use a non-blocking notification instead of alert for better UX
    console.log(`${product.name} hinzugefügt`);
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
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '16px' }}
          />
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>
      </div>

      <div className="filter-chips" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px', marginBottom: '20px', scrollbarWidth: 'none' }}>
        <button
          className={`filter-chip ${!activeSet ? 'active' : ''}`}
          onClick={() => setActiveSet(null)}
        >
          Alle
        </button>
        {sets.map(set => (
          <button
            key={set}
            className={`filter-chip ${activeSet === set ? 'active' : ''}`}
            onClick={() => setActiveSet(activeSet === set ? null : set)}
          >
            {set}
          </button>
        ))}
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              {searchTerm.length > 0 || activeSet ? (
                <>
                  <h3>Keine Ergebnisse gefunden</h3>
                  <p>Versuche es mit anderen Suchbegriffen oder Filtern.</p>
                </>
              ) : (
                <>
                  <h3>Entdecke neue Karten</h3>
                  <p>Gib mindestens 3 Zeichen ein oder wähle ein Set aus.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
