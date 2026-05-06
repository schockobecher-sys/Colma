import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, prices } = useCollection();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeSet, setActiveSet] = useState(null);

  const sets = ['151', 'Obsidianflammen', 'Gewalten der Zeit', 'Karmesin & Purpur', 'Promos'];

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    let results = CardmarketService.searchProducts(debouncedSearch);
    if (activeSet) {
      // If there was no query, searchProducts returns [], but we want to see set items
      if (debouncedSearch.length < 3) {
        // We need a way to get products by set from service
        results = CardmarketService.searchProductsBySet(activeSet);
      } else {
        results = results.filter(p => p.set === activeSet);
      }
    }
    return results;
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

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '10px' }}>
        <div className="search-input-wrapper" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
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

        <div className="filter-container">
          <button
            className={`filter-chip ${!activeSet ? 'active' : ''}`}
            onClick={() => setActiveSet(null)}
          >
            Alle Sets
          </button>
          {sets.map(setName => (
            <button
              key={setName}
              className={`filter-chip ${activeSet === setName ? 'active' : ''}`}
              onClick={() => setActiveSet(setName === activeSet ? null : setName)}
            >
              {setName}
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
            <div className="text-center text-secondary" style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <PackageSearch size={48} strokeWidth={1} />
              <div>
                {searchTerm.length > 2 || activeSet
                  ? 'Keine Ergebnisse gefunden'
                  : 'Gib mindestens 3 Zeichen ein oder wähle ein Set aus.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
