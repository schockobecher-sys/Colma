import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { useState, useMemo } from 'react';
import { Filter, SortAsc } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity } = useCollection();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    removeItem(idProduct);
    FeedbackService.triggerRemove();
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items].map(item => ({
      ...item,
      meta: metadata[item.idProduct] || { name: '', set: '', type: '' },
      currentPrice: prices[item.idProduct]?.trend || 0
    }));

    // Filter
    if (filterType !== 'all') {
      result = result.filter(item => item.meta.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': {
          return a.meta.name.localeCompare(b.meta.name);
        }
        case 'value': {
          return (b.currentPrice * b.quantity) - (a.currentPrice * a.quantity);
        }
        case 'profit': {
          const profitA = (a.currentPrice - (a.purchasePrice || 0)) * a.quantity;
          const profitB = (b.currentPrice - (b.purchasePrice || 0)) * b.quantity;
          return profitB - profitA;
        }
        case 'date':
        default: {
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        }
      }
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="filter-bar" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        <button
          className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Alle
        </button>
        <button
          className={`filter-chip ${filterType === 'Karte' ? 'active' : ''}`}
          onClick={() => setFilterType('Karte')}
        >
          Karten
        </button>
        <button
          className={`filter-chip ${filterType === 'Sealed' ? 'active' : ''}`}
          onClick={() => setFilterType('Sealed')}
        >
          Sealed
        </button>

        <div style={{ flex: 1 }}></div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 8px', fontSize: '12px' }}
        >
          <option value="date">Datum</option>
          <option value="value">Wert</option>
          <option value="profit">Profit</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map(item => {
            return (
              <ProductListItem
                key={item.idProduct}
                product={{ ...item.meta, purchasePrice: item.purchasePrice }}
                price={item.currentPrice}
                quantity={item.quantity}
                onRemove={handleRemove}
                onUpdateQuantity={updateQuantity}
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
