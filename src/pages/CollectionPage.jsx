import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { useState, useMemo } from 'react';
import { ArrowUpNarrowWide, Filter } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity } = useCollection();
  const { addToast } = useToast();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    const meta = metadata[idProduct];
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    addToast(`${meta?.name || 'Produkt'} entfernt`, 'error');
  };

  const handleUpdateQuantity = (idProduct, delta) => {
    updateQuantity(idProduct, delta);
    FeedbackService.triggerAdd(); // Small feedback
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

      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {['all', 'Karte', 'Sealed'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`filter-chip ${filterType === type ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                borderRadius: '12px',
                background: filterType === type ? 'var(--accent-secondary)' : 'var(--bg-secondary)',
                color: filterType === type ? '#fff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid var(--border)'
              }}
            >
              {type === 'all' ? 'Alle' : type}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <ArrowUpNarrowWide size={16} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: '600', outline: 'none' }}
            >
              <option value="date">Datum</option>
              <option value="value">Wert</option>
              <option value="profit">Gewinn</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {filteredAndSortedItems.length} Produkte
          </div>
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
                onUpdateQuantity={(delta) => handleUpdateQuantity(item.idProduct, delta)}
              />
            );
          })
        ) : (
          <div className="empty-collection text-center glass-panel" style={{ marginTop: '40px', padding: '40px 20px' }}>
             <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Nichts gefunden</h2>
            <p className="text-secondary" style={{ fontSize: '14px' }}>
              {items.length === 0
                ? 'Füge Produkte über die Suche hinzu.'
                : 'Passe deine Filter an, um Produkte zu sehen.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
