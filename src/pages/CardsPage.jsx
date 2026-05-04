import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);
  const { addItem, prices } = useCollection();
  const { showToast } = useToast();
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
    let results = CardmarketService.searchProducts(debouncedSearch);
    if (selectedSet) {
      // If no search term, show all from set. If search term, filter set results.
      if (!debouncedSearch) {
        results = CardmarketService.searchProducts(selectedSet);
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
    showToast(`${product.name} zur Sammlung hinzugefügt`);
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
            <button onClick={() => setSearchTerm('')} style={{ background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700' }}>Löschen</button>
          )}
        </div>

        <div className="set-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedSet(null)}
            className={`filter-chip ${selectedSet === null ? 'active' : ''}`}
          >Alle</button>
          {sets.map(setName => (
            <button
              key={setName}
              onClick={() => setSelectedSet(setName === selectedSet ? null : setName)}
              className={`filter-chip ${selectedSet === setName ? 'active' : ''}`}
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
            <div className="text-center text-secondary glass-panel" style={{ marginTop: '40px', padding: '40px 20px' }}>
              <PackageSearch size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <div style={{ fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                {debouncedSearch.length > 0 || selectedSet ? 'Keine Ergebnisse gefunden' : 'Bereit zur Suche'}
              </div>
              <div style={{ fontSize: '13px' }}>
                {debouncedSearch.length > 0 || selectedSet
                  ? 'Versuche es mit einem anderen Suchbegriff oder Filter.'
                  : 'Suche nach Karten, Sets oder Produkten (z.B. Glurak, 151, Display).'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
