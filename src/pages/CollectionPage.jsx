import { useState, useMemo } from 'react';
import { ArrowUpNarrowWide, ArrowDownNarrowWide, Filter } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity, updateItem } = useCollection();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    if (window.confirm('Produkt wirklich aus der Sammlung entfernen?')) {
      removeItem(idProduct);
      FeedbackService.triggerRemove();
    }
  };

  const sortedItems = useMemo(() => {
    let filtered = [...items];

    if (filterType !== 'all') {
      filtered = filtered.filter(item => metadata[item.idProduct]?.type === filterType);
    }

    return filtered.sort((a, b) => {
      const metaA = metadata[a.idProduct] || {};
      const metaB = metadata[b.idProduct] || {};
      const priceA = (prices[a.idProduct]?.trend || 0);
      const priceB = (prices[b.idProduct]?.trend || 0);

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
  }, [items, metadata, prices, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="filters-bar" style={{ padding: '0 16px 16px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px' }}
        >
          <option value="date">Datum (Neu zuerst)</option>
          <option value="value">Wert (Hoch zuerst)</option>
          <option value="profit">Gewinn (Hoch zuerst)</option>
          <option value="name">Name (A-Z)</option>
        </select>

        <button
          onClick={() => setFilterType('all')}
          className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
          style={{ whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '20px', background: filterType === 'all' ? 'var(--accent)' : 'var(--bg-secondary)', color: filterType === 'all' ? 'black' : 'white', fontSize: '12px', fontWeight: 'bold' }}
        >
          Alle
        </button>
        <button
          onClick={() => setFilterType('Karte')}
          className={`filter-chip ${filterType === 'Karte' ? 'active' : ''}`}
          style={{ whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '20px', background: filterType === 'Karte' ? 'var(--accent)' : 'var(--bg-secondary)', color: filterType === 'Karte' ? 'black' : 'white', fontSize: '12px', fontWeight: 'bold' }}
        >
          Karten
        </button>
        <button
          onClick={() => setFilterType('Sealed')}
          className={`filter-chip ${filterType === 'Sealed' ? 'active' : ''}`}
          style={{ whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '20px', background: filterType === 'Sealed' ? 'var(--accent)' : 'var(--bg-secondary)', color: filterType === 'Sealed' ? 'black' : 'white', fontSize: '12px', fontWeight: 'bold' }}
        >
          Sealed
        </button>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {sortedItems.length > 0 ? (
          sortedItems.map(item => {
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
                onUpdatePrice={(id, price) => updateItem(id, { purchasePrice: price })}
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
