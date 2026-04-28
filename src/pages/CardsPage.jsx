import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, PackageSearch, Sparkles } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import germanProducts from '../data/germanProducts.json';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, prices } = useCollection();
  const { addToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSet, setSelectedSet] = useState('Alle');

  const sets = useMemo(() => {
    return ['Alle', ...new Set(germanProducts.map(p => p.set))];
  }, []);

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    let results = CardmarketService.searchProducts(debouncedSearch);
    if (selectedSet !== 'Alle') {
      results = results.filter(p => p.set === selectedSet);
    }
    return results;
  }, [debouncedSearch, selectedSet]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
    addToast(`${product.name} zur Sammlung hinzugefügt`);
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
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>

        <div className="set-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {sets.map(set => (
            <button
              key={set}
              onClick={() => setSelectedSet(set)}
              style={{
                background: selectedSet === set ? 'var(--accent)' : 'var(--bg-secondary)',
                color: selectedSet === set ? '#000' : 'white',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
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
          {debouncedSearch || selectedSet !== 'Alle' ? 'Ergebnisse' : 'Vorschläge'}
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
            <div className="text-center glass-panel" style={{ marginTop: '20px', padding: '40px 20px' }}>
              <div style={{ marginBottom: '16px', color: 'var(--accent)', opacity: 0.5 }}>
                <PackageSearch size={48} strokeWidth={1.5} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>
                {searchTerm.length > 2 ? 'Keine Treffer' : 'Bereit für die Suche?'}
              </h3>
              <p className="text-secondary" style={{ fontSize: '13px' }}>
                {searchTerm.length > 2
                  ? 'Versuche es mit einem anderen Suchbegriff oder Filter.'
                  : 'Gib den Namen einer Karte oder eines Sets ein (z.B. "Glurak" oder "151").'}
              </p>
              {searchTerm.length <= 2 && (
                <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {['Glurak', 'Mew', 'Pikachu', '151', 'Display'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchTerm(tag)}
                      style={{ background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: 'var(--accent)' }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
