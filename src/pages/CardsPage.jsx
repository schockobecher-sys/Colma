import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Info } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, prices } = useCollection();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    return CardmarketService.searchProducts(debouncedSearch);
  }, [debouncedSearch]);

  const groupedResults = useMemo(() => {
    const groups = {};
    searchResults.forEach(result => {
      if (!groups[result.set]) {
        groups[result.set] = [];
      }
      groups[result.set].push(result);
    });
    return groups;
  }, [searchResults]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    FeedbackService.triggerAdd();
  };

  return (
    <div className="search-page">
      <header className="app-header">
        <h1 className="app-title">Suche</h1>
      </header>

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '20px' }}>
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

      <div className="results-list" style={{ padding: '0 16px' }}>
        {Object.keys(groupedResults).length > 0 ? (
          Object.entries(groupedResults).map(([setName, products]) => (
            <section key={setName} style={{ marginBottom: '24px' }}>
              <div className="section-title" style={{ fontSize: '14px', opacity: 0.8 }}>{setName}</div>
              <div className="product-list">
                {products.map(result => (
                  <ProductListItem
                    key={result.idProduct}
                    product={result}
                    price={prices[result.idProduct]?.trend || 0}
                    onAdd={handleAdd}
                    isSearch={true}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center text-secondary" style={{ marginTop: '60px', padding: '0 20px' }}>
            {searchTerm.length > 2 ? (
              <>
                 <div className="pokeball-loader" style={{ animation: 'none', opacity: 0.3, marginBottom: '20px' }}></div>
                 <p style={{ fontWeight: 700, color: 'white' }}>Keine Ergebnisse gefunden</p>
                 <p style={{ fontSize: '14px' }}>Versuche es mit einem anderen Suchbegriff.</p>
              </>
            ) : (
              <>
                <Info size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p style={{ fontWeight: 700, color: 'white' }}>Bereit zur Suche</p>
                <p style={{ fontSize: '14px' }}>Gib mindestens 3 Zeichen ein (z.B. Glurak, 151), um in der Datenbank zu suchen.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
