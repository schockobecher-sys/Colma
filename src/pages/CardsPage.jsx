import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
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

  const groupedResults = useMemo(() => {
    const results = CardmarketService.searchProducts(debouncedSearch);
    const groups = {};
    results.forEach(product => {
      if (!groups[product.set]) groups[product.set] = [];
      groups[product.set].push(product);
    });
    return groups;
  }, [debouncedSearch]);

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

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={20} className="text-secondary" />
          <input
            type="text"
            placeholder="Karten oder Produkte suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>
      </div>

      <div className="results-list" style={{ padding: '0 16px' }}>
        {Object.keys(groupedResults).length > 0 ? (
          Object.entries(groupedResults).map(([setName, products]) => (
            <div key={setName} style={{ marginBottom: '24px' }}>
              <div className="section-title">{setName}</div>
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
            </div>
          ))
        ) : (
          <div className="text-center text-secondary" style={{ marginTop: '40px' }}>
            {searchTerm.length > 2 ? 'Keine Ergebnisse gefunden' : 'Gib mindestens 3 Zeichen ein (z.B. Glurak, 151)'}
          </div>
        )}
      </div>
    </div>
  );
}
