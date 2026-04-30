import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const { addItem, prices } = useCollection();
  const { showToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const sets = [
    '151',
    'Obsidianflammen',
    'Gewalten der Zeit',
    'Karmesin & Purpur',
    'Entfesseltes Karma',
    'Promos'
  ];

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

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '12px' }}>
        <div className="search-input-wrapper" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} className="text-secondary" />
          <input
            type="text"
            placeholder="Karten oder Produkte suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '16px' }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
              <X size={18} />
            </button>
          )}
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>
      </div>

      <div className="set-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 20px', scrollbarWidth: 'none' }}>
        <style>{`.set-filters::-webkit-scrollbar { display: none; }`}</style>
        {sets.map(set => (
          <button
            key={set}
            onClick={() => setSelectedSet(selectedSet === set ? '' : set)}
            className={`glass-panel ${selectedSet === set ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              whiteSpace: 'nowrap',
              fontSize: '13px',
              fontWeight: '600',
              color: selectedSet === set ? 'var(--accent)' : 'var(--text-secondary)',
              background: selectedSet === set ? 'rgba(255, 203, 5, 0.1)' : 'var(--glass-bg)',
              borderColor: selectedSet === set ? 'var(--accent)' : 'var(--glass-border)'
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
                isSearch={true}
              />
            ))
          ) : (
            <div className="text-center text-secondary glass-panel" style={{ marginTop: '40px', padding: '40px 20px' }}>
              <Search size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <div>
                {searchTerm.length > 0 && searchTerm.length < 3
                  ? 'Gib mindestens 3 Zeichen ein...'
                  : 'Keine Ergebnisse gefunden. Versuche es mit einem anderen Suchbegriff oder wähle ein Set aus.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
