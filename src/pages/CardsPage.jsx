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

  const searchResults = useMemo(() => {
    const rawResults = CardmarketService.searchProducts(debouncedSearch);

    // Group by set
    const grouped = rawResults.reduce((acc, curr) => {
      const setName = curr.set || 'Andere';
      if (!acc[setName]) acc[setName] = [];
      acc[setName].push(curr);
      return acc;
    }, {});

    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
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
            className="search-input"
          />
          <SlidersHorizontal size={20} className="text-secondary" />
        </div>
      </div>

      <div className="results-list">
        {searchResults.length > 0 ? (
          searchResults.map(([setName, products]) => (
            <div key={setName} className="set-group">
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
