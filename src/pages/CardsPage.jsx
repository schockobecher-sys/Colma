import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);
  const { addItem, prices } = useCollection();
  const { addToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const sets = ['151', 'Obsidianflammen', 'Gewalten der Zeit', 'Karmesin & Purpur', 'Promos', 'Entfesseltes Karma'];

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
      results = results.filter(p => p.set === selectedSet);
    }
    return results;
  }, [debouncedSearch, selectedSet]);

  // If search is empty but set is selected, we want to show products from that set
  const displayedResults = useMemo(() => {
    if (debouncedSearch.length < 3 && selectedSet) {
      return CardmarketService.searchProducts('').filter(p => p.set === selectedSet);
    }
    return searchResults;
  }, [searchResults, debouncedSearch, selectedSet]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
    addToast(`${product.name} zur Sammlung hinzugefügt`);
  };

  const toggleSet = (set) => {
    setSelectedSet(selectedSet === set ? null : set);
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
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>

        <div className="filter-chips" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {sets.map(set => (
            <button
              key={set}
              onClick={() => toggleSet(set)}
              className={`filter-chip ${selectedSet === set ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: selectedSet === set ? 'var(--accent)' : 'var(--bg-secondary)',
                color: selectedSet === set ? '#000' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid var(--border)'
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
          <span style={{ fontSize: '12px', fontWeight: 'normal' }}>{displayedResults.length} gefunden</span>
        </div>
        <div className="product-list">
          {displayedResults.length > 0 ? (
            displayedResults.map(result => (
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
              {searchTerm.length > 0 || selectedSet
                ? 'Keine Ergebnisse gefunden'
                : 'Gib mindestens 3 Zeichen ein oder wähle ein Set'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
