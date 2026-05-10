import { useState, useMemo } from 'react';
import { ArrowUpDown, Filter } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity, updatePurchasePrice } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('all');

  const handleRemove = (idProduct) => {
    if (confirm('Produkt wirklich aus der Sammlung entfernen?')) {
      removeItem(idProduct);
      FeedbackService.triggerRemove();
      showToast('Produkt entfernt', 'error');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filtering
    if (filterType !== 'all') {
      result = result.filter(item => {
        const meta = metadata[item.idProduct];
        return meta?.type === filterType;
      });
    }

    // Sorting
    result.sort((a, b) => {
      const metaA = metadata[a.idProduct] || {};
      const metaB = metadata[b.idProduct] || {};
      const priceA = prices[a.idProduct]?.trend || 0;
      const priceB = prices[b.idProduct]?.trend || 0;

      switch (sortBy) {
        case 'value':
          return (priceB * b.quantity) - (priceA * a.quantity);
        case 'profit': {
          const profitA = (priceA - (a.purchasePrice || 0)) * a.quantity;
          const profitB = (priceB - (b.purchasePrice || 0)) * b.quantity;
          return profitB - profitA;
        }
        case 'name':
          return (metaA.name || '').localeCompare(metaB.name || '');
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

      <div className="controls" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', padding: '10px 35px 10px 12px', appearance: 'none', fontSize: '14px' }}
          >
            <option value="date">Datum (Neu)</option>
            <option value="value">Wert (Hoch)</option>
            <option value="profit">Profit (Hoch)</option>
            <option value="name">Name (A-Z)</option>
          </select>
          <ArrowUpDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', padding: '10px 35px 10px 12px', appearance: 'none', fontSize: '14px' }}
          >
            <option value="all">Alle Typen</option>
            <option value="Karte">Karten</option>
            <option value="Sealed">Sealed</option>
          </select>
          <Filter size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
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
                purchasePrice={item.purchasePrice}
                onRemove={handleRemove}
                onUpdateQuantity={updateQuantity}
                onUpdatePrice={updatePurchasePrice}
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
