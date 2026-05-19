import { useMemo, useState } from 'react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { Filter, ArrowUpNarrowWide } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('date'); // date, value, profit, name
  const [filterType, setFilterType] = useState('All'); // All, Karte, Sealed

  const handleRemove = (idProduct) => {
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    showToast('Aus der Sammlung entfernt', 'info');
  };

  const handleUpdateQuantity = (idProduct, delta) => {
    updateQuantity(idProduct, delta);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items].map(item => ({
      ...item,
      meta: metadata[item.idProduct] || { name: 'Lade...', set: '', type: 'Karte' },
      currentPrice: prices[item.idProduct]?.trend || 0
    }));

    // Filter
    if (filterType !== 'All') {
      result = result.filter(item => item.meta.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b.currentPrice * b.quantity) - (a.currentPrice * a.quantity);
        case 'profit': {
          const profitA = (a.currentPrice - (a.purchasePrice || 0)) * a.quantity;
          const profitB = (b.currentPrice - (b.purchasePrice || 0)) * b.quantity;
          return profitB - profitA;
        }
        case 'name':
          return a.meta.name.localeCompare(b.meta.name);
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

      <div className="filters-container" style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['All', 'Karte', 'Sealed'].map(type => (
            <button
              key={type}
              className={`filter-chip ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'All' ? 'Alle' : type}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <ArrowUpNarrowWide size={14} />
          <span>Sortieren nach:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
          >
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="profit">Profit</option>
            <option value="name">Name</option>
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
              purchasePrice={item.purchasePrice}
              onRemove={handleRemove}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))
        ) : (
          <div className="empty-collection text-center glass-panel" style={{ marginTop: '40px', padding: '40px 20px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Keine Einträge gefunden</h2>
            <p className="text-secondary" style={{ fontSize: '13px' }}>
              {items.length === 0
                ? 'Füge Produkte über die Suche hinzu, um dein Portfolio zu tracken.'
                : 'Passe deine Filter an, um Produkte zu sehen.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
