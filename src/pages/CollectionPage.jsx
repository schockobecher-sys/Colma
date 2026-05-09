import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { Filter, ArrowUpNarrowWide } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem } = useCollection();
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('date');

  const handleRemove = (idProduct) => {
    removeItem(idProduct);
    FeedbackService.triggerRemove();
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterType !== 'All') {
      result = result.filter(item => {
        const meta = metadata[item.idProduct];
        return meta && meta.type === filterType;
      });
    }

    // Sort
    result.sort((a, b) => {
      const metaA = metadata[a.idProduct] || {};
      const metaB = metadata[b.idProduct] || {};
      const priceA = prices[a.idProduct]?.trend || 0;
      const priceB = prices[b.idProduct]?.trend || 0;

      switch (sortBy) {
        case 'name':
          return (metaA.name || '').localeCompare(metaB.name || '');
        case 'value':
          return (priceB * b.quantity) - (priceA * a.quantity);
        case 'profit': {
          const profitA = (priceA - (a.purchasePrice || 0)) * a.quantity;
          const profitB = (priceB - (b.purchasePrice || 0)) * b.quantity;
          return profitB - profitA;
        }
        case 'date':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    return result;
  }, [items, metadata, prices, filterType, sortBy]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="filter-bar" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '4px' }} className="no-scrollbar">
          {['All', 'Karte', 'Sealed'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`filter-chip ${filterType === type ? 'active' : ''}`}
            >
              {type}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpNarrowWide size={16} className="text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
          >
            <option value="date">Neueste zuerst</option>
            <option value="name">Name (A-Z)</option>
            <option value="value">Höchster Wert</option>
            <option value="profit">Höchster Gewinn</option>
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
              />
            );
          })
        ) : (
          <div className="empty-collection text-center glass-panel" style={{ marginTop: '40px', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Keine Produkte gefunden</h2>
            <p className="text-secondary" style={{ fontSize: '14px' }}>
              {items.length === 0
                ? 'Füge Produkte über die Suche hinzu, um dein Portfolio zu tracken.'
                : 'Passe deine Filter an, um mehr Ergebnisse zu sehen.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
