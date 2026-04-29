import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { useState, useMemo } from 'react';
import { Filter, ArrowUpNarrowWide } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    const name = metadata[idProduct]?.name || 'Produkt';
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    showToast(`${name} entfernt`, 'error');
  };

  const handleUpdateQuantity = (idProduct, delta) => {
    updateQuantity(idProduct, delta);
    FeedbackService.vibrate(10);
  };

  const sortedAndFilteredItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterType !== 'all') {
      result = result.filter(item => metadata[item.idProduct]?.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      const metaA = metadata[a.idProduct] || { name: '' };
      const metaB = metadata[b.idProduct] || { name: '' };
      const priceA = prices[a.idProduct]?.trend || 0;
      const priceB = prices[b.idProduct]?.trend || 0;

      if (sortBy === 'name') {
        return metaA.name.localeCompare(metaB.name);
      } else if (sortBy === 'value') {
        return (priceB * b.quantity) - (priceA * a.quantity);
      } else if (sortBy === 'profit') {
        const profitA = (priceA - (a.purchasePrice || 0)) * a.quantity;
        const profitB = (priceB - (b.purchasePrice || 0)) * b.quantity;
        return profitB - profitA;
      } else { // date
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

      <div className="toolbar" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', appearance: 'none', fontSize: '14px' }}
          >
            <option value="date">Datum (Neu)</option>
            <option value="value">Wert (Hoch)</option>
            <option value="profit">Profit (Hoch)</option>
            <option value="name">Name (A-Z)</option>
          </select>
          <ArrowUpNarrowWide size={16} className="text-secondary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', appearance: 'none', fontSize: '14px' }}
          >
            <option value="all">Alle Typen</option>
            <option value="Karte">Karten</option>
            <option value="Sealed">Sealed</option>
          </select>
          <Filter size={16} className="text-secondary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {sortedAndFilteredItems.length > 0 ? (
          sortedAndFilteredItems.map(item => {
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
