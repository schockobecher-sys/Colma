import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
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

  const sets = ['151', 'Obsidianflammen', 'Gewalten der Zeit', 'Karmesin & Purpur', 'Entfesseltes Karma', 'Promos'];

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
    showToast(`${product.name} hinzugefügt`);
  };

  return (
    <div className="search-page">
      <header className="app-header">
        <h1 className="app-title">Suche</h1>
      </header>

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '16px' }}>
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

        <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '8px' }} className="no-scrollbar">
          <button
            onClick={() => setSelectedSet('')}
            className={`filter-chip ${selectedSet === '' ? 'active' : ''}`}
          >
            Alle Sets
          </button>
          {sets.map(set => (
            <button
              key={set}
              onClick={() => setSelectedSet(set === selectedSet ? '' : set)}
              className={`filter-chip ${selectedSet === set ? 'active' : ''}`}
            >
              {set}
            </button>
          ))}
        </div>
      </div>

      <div className="results-list" style={{ padding: '0 16px' }}>
        <div className="section-title">
          {selectedSet ? `${selectedSet} Ergebnisse` : 'Ergebnisse'}
        </div>
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
            <div className="text-center" style={{ marginTop: '40px' }}>
              {searchTerm.length > 0 || selectedSet ? (
                <div className="text-secondary">Keine Ergebnisse gefunden</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div className="pokeball-loader"></div>
                  <div className="text-secondary">Bereit für die Suche...</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
