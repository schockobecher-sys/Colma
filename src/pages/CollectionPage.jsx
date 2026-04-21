import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../components/Toast';
import { Filter, SortAsc, LayoutGrid, List } from 'lucide-react';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    const name = metadata[idProduct]?.name || 'Produkt';
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    showToast(`${name} entfernt`, 'error');
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items].map(item => {
      const meta = metadata[item.idProduct] || {};
      const currentPrice = prices[item.idProduct]?.trend || 0;
      const totalValue = currentPrice * item.quantity;
      const totalCost = (item.purchasePrice || 0) * item.quantity;
      const profit = totalValue - totalCost;
      return { ...item, meta, currentPrice, totalValue, profit };
    });

    // Filtering
    if (filterType !== 'all') {
      result = result.filter(item => item.meta.type === filterType);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.meta.name || '').localeCompare(b.meta.name || '');
      } else if (sortBy === 'value') {
        return b.totalValue - a.totalValue;
      } else if (sortBy === 'profit') {
        return b.profit - a.profit;
      } else {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="filters-bar" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <div className="filter-select-wrapper" style={{ flex: 1, position: 'relative' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '100%', padding: '10px 32px 10px 12px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', appearance: 'none', fontSize: '14px' }}
          >
            <option value="date">Zuletzt hinzugefügt</option>
            <option value="value">Höchster Wert</option>
            <option value="profit">Höchster Gewinn</option>
            <option value="name">Name A-Z</option>
          </select>
          <SortAsc size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
        </div>

        <div className="filter-select-wrapper" style={{ flex: 1, position: 'relative' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '100%', padding: '10px 32px 10px 12px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', appearance: 'none', fontSize: '14px' }}
          >
            <option value="all">Alle Typen</option>
            <option value="Karte">Karten</option>
            <option value="Sealed">Sealed</option>
          </select>
          <Filter size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map(item => (
            <ProductListItem
              key={item.idProduct}
              product={item.meta.idProduct ? item.meta : { idProduct: item.idProduct, name: 'Lade...', set: '', image: '⏳' }}
              price={item.currentPrice}
              quantity={item.quantity}
              onRemove={handleRemove}
            />
          ))
        ) : (
          <div className="empty-collection text-center" style={{ marginTop: '60px' }}>
            <div className="pokeball-loader" style={{ animation: 'none', opacity: 0.3 }}></div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Keine Einträge</h2>
            <p className="text-secondary">Passe deine Filter an oder füge neue Produkte hinzu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
