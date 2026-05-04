import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { useState, useMemo } from 'react';
import { Filter, ArrowUpNarrowWide, Search as SearchIcon } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity, updatePurchasePrice } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('date'); // date, value, profit, name
  const [filterType, setFilterType] = useState('all'); // all, Karte, Sealed
  const [searchQuery, setSearchQuery] = useState('');

  const handleRemove = (idProduct) => {
    const meta = metadata[idProduct];
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    showToast(`${meta?.name || 'Produkt'} entfernt`, 'error');
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items].map(item => {
      const meta = metadata[item.idProduct] || { name: '', type: '', set: '' };
      const currentPrice = prices[item.idProduct]?.trend || 0;
      const totalValue = currentPrice * item.quantity;
      const totalCost = (item.purchasePrice || 0) * item.quantity;
      const profit = totalValue - totalCost;

      return { ...item, meta, currentPrice, totalValue, profit };
    });

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.meta.name.toLowerCase().includes(q) ||
        item.meta.set.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filterType !== 'all') {
      result = result.filter(item => item.meta.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'value': return b.totalValue - a.totalValue;
        case 'profit': return b.profit - a.profit;
        case 'name': return a.meta.name.localeCompare(b.meta.name);
        case 'date':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType, searchQuery]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="collection-controls" style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div className="search-input-wrapper" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <SearchIcon size={18} className="text-secondary" />
          <input
            type="text"
            placeholder="In Sammlung suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <div className="filter-chip-group" style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilterType('all')}
              className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
            >Alle</button>
            <button
              onClick={() => setFilterType('Karte')}
              className={`filter-chip ${filterType === 'Karte' ? 'active' : ''}`}
            >Karten</button>
            <button
              onClick={() => setFilterType('Sealed')}
              className={`filter-chip ${filterType === 'Sealed' ? 'active' : ''}`}
            >Sealed</button>
          </div>

          <div style={{ width: '1px', background: 'var(--border)', margin: '4px 4px' }}></div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', padding: '4px 8px', fontSize: '12px', outline: 'none' }}
          >
            <option value="date">Neueste</option>
            <option value="value">Wert</option>
            <option value="profit">Gewinn</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map(item => {
            return (
              <ProductListItem
                key={item.idProduct}
                product={item.meta}
                price={item.currentPrice}
                quantity={item.quantity}
                purchasePrice={item.purchasePrice}
                onRemove={handleRemove}
                onUpdateQuantity={updateQuantity}
                onUpdatePurchasePrice={updatePurchasePrice}
              />
            );
          })
        ) : (
          <div className="empty-collection text-center" style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Deine Sammlung ist leer</h2>
            <p className="text-secondary">Füge Produkte über die Suche hinzu, um dein Portfolio zu tracken.</p>
          </div>
        )}
      </div>
    </div>
  );
}
