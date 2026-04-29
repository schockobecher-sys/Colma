import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, prices } = useCollection();
  const { showToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSet, setSelectedSet] = useState('Alle');

  const sets = ['Alle', '151', 'Obsidianflammen', 'Gewalten der Zeit', 'Karmesin & Purpur', 'Promos'];

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    let results = CardmarketService.searchProducts(debouncedSearch);

    // If no search term but a set is selected, show all cards from that set
    if (debouncedSearch.length < 3 && selectedSet !== 'Alle') {
      results = CardmarketService.searchProducts('').filter(p => p.set === selectedSet);
    } else if (selectedSet !== 'Alle') {
      results = results.filter(p => p.set === selectedSet);
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

      <div className="set-filters" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {sets.map(setName => (
          <button
            key={setName}
            onClick={() => setSelectedSet(setName)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              fontSize: '13px',
              fontWeight: '700',
              background: selectedSet === setName ? 'var(--accent)' : 'var(--bg-secondary)',
              color: selectedSet === setName ? '#000' : 'white',
              border: '1px solid var(--border)',
              transition: 'all 0.2s ease'
            }}
          >
            {setName}
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
            <div className="text-center text-secondary" style={{ marginTop: '40px' }}>
              {debouncedSearch.length > 2 || selectedSet !== 'Alle' ? 'Keine Ergebnisse gefunden' : 'Gib mindestens 3 Zeichen ein oder wähle ein Set'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
