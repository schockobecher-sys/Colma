import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSet, setActiveSet] = useState(null);
  const { addItem, toggleWishlist, wishlist, prices } = useCollection();
  const { showToast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Extract unique sets for filters
  const sets = useMemo(() => {
    const allProducts = CardmarketService.searchProducts('');
    const uniqueSets = [...new Set(allProducts.map(p => p.set))];
    return uniqueSets.sort();
  }, []);

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
    addItem(product, 1, price);
    FeedbackService.triggerAdd();
    showToast(`${product.name} zur Sammlung hinzugefügt`);
  };

  const handleToggleWishlist = (idProduct) => {
    toggleWishlist(idProduct);
    const isAdding = !wishlist.includes(idProduct);
    showToast(isAdding ? 'Auf die Wunschliste gesetzt' : 'Von der Wunschliste entfernt', isAdding ? 'success' : 'info');
  };

  return (
    <div className="search-page">
      <header className="app-header">
        <h1 className="app-title">Suche</h1>
      </header>

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '16px' }}>
        <div className="search-input-wrapper glass-panel" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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

      <div className="set-filters" style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '0 16px', marginBottom: '20px', scrollbarWidth: 'none' }}>
        <button
          className={`filter-chip ${activeSet === null ? 'active' : ''}`}
          onClick={() => { setActiveSet(null); setSearchTerm(''); }}
        >
          Alle
        </button>
        {sets.map(setName => (
          <button
            key={setName}
            className={`filter-chip ${activeSet === setName ? 'active' : ''}`}
            onClick={() => { setActiveSet(setName); setSearchTerm(''); }}
          >
            {setName}
          </button>
        ))}
      </div>

      <div className="results-list" style={{ padding: '0 16px' }}>
        <div className="section-title">
          {activeSet ? `${activeSet} Produkte` : 'Ergebnisse'}
          <span style={{ fontSize: '10px', opacity: 0.6 }}>{searchResults.length} Treffer</span>
        </div>

        <div className="product-list">
          {searchResults.length > 0 ? (
            searchResults.map(result => (
              <ProductListItem
                key={result.idProduct}
                product={result}
                price={prices[result.idProduct]?.trend || 0}
                onAdd={handleAdd}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
                isSearch={true}
              />
            ))
          ) : (
            <div className="empty-state text-center glass-panel" style={{ marginTop: '40px', padding: '40px 20px' }}>
              <div style={{ marginBottom: '16px', opacity: 0.3 }}><Search size={48} style={{ margin: '0 auto' }}/></div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Keine Ergebnisse gefunden</h3>
              <p className="text-secondary" style={{ fontSize: '13px' }}>
                {searchTerm.length > 0
                  ? 'Versuche es mit einem anderen Suchbegriff oder Set.'
                  : 'Wähle ein Set aus oder gib mindestens 3 Zeichen ein.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
