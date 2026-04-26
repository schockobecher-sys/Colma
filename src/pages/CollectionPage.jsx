import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { Filter, ArrowUpNarrowWide } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, updateQuantity } = useCollection();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleUpdateQuantity = (idProduct, delta) => {
    updateQuantity(idProduct, delta);
    if (delta > 0) FeedbackService.triggerAdd();
    else FeedbackService.triggerRemove();
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items].map(item => {
      const meta = metadata[item.idProduct] || { idProduct: item.idProduct, name: 'Lade...', set: '', type: 'Karte' };
      const currentPrice = prices[item.idProduct]?.trend || 0;
      const profit = (currentPrice - (item.purchasePrice || 0)) * item.quantity;
      return { ...item, meta, currentPrice, profit };
    });

    // Filter
    if (filterType !== 'all') {
      result = result.filter(item => item.meta.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.dateAdded) - new Date(a.dateAdded);
      if (sortBy === 'value') return (b.currentPrice * b.quantity) - (a.currentPrice * a.quantity);
      if (sortBy === 'profit') return b.profit - a.profit;
      if (sortBy === 'name') return a.meta.name.localeCompare(b.meta.name);
      return 0;
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="controls-container" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpNarrowWide size={16} className="text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '14px', width: '100%', outline: 'none' }}
          >
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="profit">Gewinn</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="glass-panel" style={{ flex: 1, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} className="text-secondary" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '14px', width: '100%', outline: 'none' }}
          >
            <option value="all">Alle Typen</option>
            <option value="Karte">Karten</option>
            <option value="Sealed">Sealed</option>
          </select>
        </div>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map(item => (
            <ProductListItem
              key={item.idProduct}
              product={item.meta}
              price={item.currentPrice}
              quantity={item.quantity}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))
        ) : (
          <div className="empty-collection text-center" style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Keine Produkte gefunden</h2>
            <p className="text-secondary">Passe deine Filter an oder füge neue Produkte hinzu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
