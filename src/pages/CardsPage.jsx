import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Loader2, X, Filter } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { CardmarketService } from '../services/CardmarketService';
import ProductListItem from '../components/ProductListItem';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, prices } = useCollection();
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(searchResults.map(r => r.categoryName));
    return ['All', ...Array.from(cats)].sort();
  }, [searchResults]);

  const filteredResults = useMemo(() => {
    if (activeCategory === 'All') return searchResults;
    return searchResults.filter(r => r.categoryName === activeCategory);
  }, [searchResults, activeCategory]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 3) {
        setIsSearching(true);
        const results = await CardmarketService.searchProducts(searchTerm);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleAdd = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
  };

  return (
    <div className="search-page fade-in">
      <header className="app-header">
        <h1 className="app-title">Suche<span>DB</span></h1>
      </header>

      <div className="search-container" style={{ padding: '0 16px', marginBottom: '10px' }}>
        <div className="search-input-wrapper" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow)' }}>
          {isSearching ? <Loader2 size={22} className="text-accent animate-spin" /> : <Search size={22} className="text-secondary" />}
          <input
            type="text"
            placeholder="Glurak, 151, Booster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '18px', fontWeight: 600 }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
                <X size={20} />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ background: 'none', border: 'none', color: showFilters ? 'var(--pk-yellow)' : 'var(--text-secondary)' }}
          >
            <SlidersHorizontal size={22} />
          </button>
        </div>
      </div>

      {showFilters && searchResults.length > 0 && (
        <div className="filter-scroll" style={{ display: 'flex', overflowX: 'auto', gap: '10px', padding: '0 16px 16px', scrollbarWidth: 'none' }}>
           {categories.map(cat => (
               <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: activeCategory === cat ? 'var(--pk-blue)' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                }}
               >
                   {cat}
               </button>
           ))}
        </div>
      )}

      <div className="results-list" style={{ padding: '0 16px' }}>
        <div className="section-title">
          {filteredResults.length > 0 ? `${filteredResults.length} Ergebnisse` : 'Suche'}
          <Filter size={18} className="text-secondary" />
        </div>
        <div className="product-list">
          {filteredResults.length > 0 ? (
            filteredResults.map(result => (
              <ProductListItem
                key={result.idProduct}
                product={result}
                price={prices[result.idProduct]?.trend || 0}
                onAdd={handleAdd}
                isSearch={true}
              />
            ))
          ) : (
            !isSearching && (
              <div className="text-center" style={{ marginTop: '60px' }}>
                <Search size={48} className="text-secondary" style={{ opacity: 0.2, marginBottom: '20px' }} />
                <div className="text-secondary" style={{ fontSize: '14px' }}>
                  {searchTerm.length >= 3 ? 'Nichts gefunden.' : 'Entdecke über 100.000 Produkte'}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
