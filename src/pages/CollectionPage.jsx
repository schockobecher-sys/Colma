import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { Filter, SortAsc } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem } = useCollection();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    removeItem(idProduct);
    FeedbackService.triggerRemove();
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterType !== 'all') {
      result = result.filter(item => {
        const meta = metadata[item.idProduct];
        return meta?.type === filterType;
      });
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
        case 'date':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType]);

  const stats = useMemo(() => {
    const totalValue = filteredAndSortedItems.reduce((sum, item) => {
      return sum + (prices[item.idProduct]?.trend || 0) * item.quantity;
    }, 0);
    return {
      totalValue,
      count: filteredAndSortedItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [filteredAndSortedItems, prices]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="text-secondary" style={{ fontSize: '12px', fontWeight: 700 }}>
              {filteredAndSortedItems.length} Produkte ({stats.count} Items)
            </div>
            <div className="text-accent" style={{ fontWeight: 800 }}>
              {stats.totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setFilterType('all')}
              className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilterType('Karte')}
              className={`filter-chip ${filterType === 'Karte' ? 'active' : ''}`}
            >
              Karten
            </button>
            <button
              onClick={() => setFilterType('Sealed')}
              className={`filter-chip ${filterType === 'Sealed' ? 'active' : ''}`}
            >
              Sealed
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <SortAsc size={16} className="text-secondary" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                flex: 1
              }}
            >
              <option value="date" style={{ background: '#1a1d23' }}>Zuletzt hinzugefügt</option>
              <option value="value" style={{ background: '#1a1d23' }}>Höchster Wert</option>
              <option value="name" style={{ background: '#1a1d23' }}>Name (A-Z)</option>
            </select>
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
                onRemove={handleRemove}
                purchasePrice={item.purchasePrice}
              />
            );
          })
        ) : (
          <div className="empty-collection text-center" style={{ marginTop: '60px' }}>
            <div className="pokeball-loader" style={{ animation: 'none', opacity: 0.2 }}></div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Keine Ergebnisse</h2>
            <p className="text-secondary">Passe deine Filter an oder füge neue Karten hinzu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
