import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, prices } = useCollection();
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Search in the curated database
    const results = CardmarketService.searchProducts(searchTerm);
    setSearchResults(results);
  }, [searchTerm]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    alert(`${product.name} zur Sammlung hinzugefügt!`);
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
              {searchTerm.length > 2 ? 'Keine Ergebnisse gefunden' : 'Gib mindestens 3 Zeichen ein (z.B. Glurak, 151)'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
