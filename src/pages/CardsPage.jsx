import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, prices, toggleWishlist } = useCollection();
  const { showToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);

  const sets = ["151", "Obsidianflammen", "Gewalten der Zeit", "Karmesin & Purpur", "Promos"];

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    return CardmarketService.searchProducts(debouncedSearch, selectedSet);
  }, [debouncedSearch, selectedSet]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
    showToast(`${product.name} zur Sammlung hinzugefügt`, 'success');
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
        </div>
      </div>

      <div className="set-filters" style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '0 16px 20px', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setSelectedSet(null)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
            background: !selectedSet ? 'var(--accent)' : 'var(--bg-secondary)',
            color: !selectedSet ? '#000' : 'white',
            fontSize: '13px',
            fontWeight: '700'
          }}
        >
          Alle Sets
        </button>
        {sets.map(set => (
          <button
            key={set}
            onClick={() => setSelectedSet(set === selectedSet ? null : set)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              background: selectedSet === set ? 'var(--accent)' : 'var(--bg-secondary)',
              color: selectedSet === set ? '#000' : 'white',
              fontSize: '13px',
              fontWeight: '700'
            }}
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
                onToggleWishlist={toggleWishlist}
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
