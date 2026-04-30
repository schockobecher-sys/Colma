import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { useState, useMemo } from 'react';
import { ArrowUpNarrowWide, Filter } from 'lucide-react';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('date'); // date, value, profit, name
  const [filterType, setFilterType] = useState('all'); // all, Karte, Sealed

  const handleRemove = (idProduct) => {
    const item = items.find(i => i.idProduct === idProduct);
    const meta = metadata[idProduct];
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    showToast(`${meta?.name || 'Produkt'} entfernt`, 'info');
  };

  const handleUpdateQuantity = (idProduct, delta) => {
    updateQuantity(idProduct, delta);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterType !== 'all') {
      result = result.filter(item => metadata[item.idProduct]?.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      const metaA = metadata[a.idProduct] || {};
      const metaB = metadata[b.idProduct] || {};
      const priceA = (prices[a.idProduct]?.trend || 0) * a.quantity;
      const priceB = (prices[b.idProduct]?.trend || 0) * b.quantity;

      switch (sortBy) {
        case 'value':
          return priceB - priceA;
        case 'name':
          return (metaA.name || '').localeCompare(metaB.name || '');
        case 'profit':
          const profitA = priceA - (a.purchasePrice || 0) * a.quantity;
          const profitB = priceB - (b.purchasePrice || 0) * b.quantity;
          return profitB - profitA;
        case 'date':
        default:
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

      <div className="collection-controls" style={{ padding: '0 16px 20px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
        <div className="glass-panel" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <ArrowUpNarrowWide size={16} className="text-accent" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '13px', fontWeight: '600', outline: 'none' }}
          >
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="profit">Profit</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="glass-panel" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Filter size={16} className="text-accent-secondary" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '13px', fontWeight: '600', outline: 'none' }}
          >
            <option value="all">Alle Typen</option>
            <option value="Karte">Karte</option>
            <option value="Sealed">Sealed</option>
          </select>
        </div>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map(item => {
            const meta = metadata[item.idProduct] || { idProduct: item.idProduct, name: 'Lade...', set: '', image: '⏳' };
            const price = prices[item.idProduct]?.trend || 0;
            return (
              <ProductListItem
                key={item.idProduct}
                product={meta}
                price={price}
                quantity={item.quantity}
                onRemove={handleRemove}
                onUpdateQuantity={handleUpdateQuantity}
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
