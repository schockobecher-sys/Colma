import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { Filter, ArrowUpNarrowWide, LayoutGrid } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity } = useCollection();
  const { addToast } = useToast();
  const [filterType, setFilterType] = useState('All'); // All, Karte, Sealed
  const [sortBy, setSortBy] = useState('Date'); // Date, Value, Profit, Name

  const handleRemove = (idProduct) => {
    const meta = metadata[idProduct];
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    addToast(`${meta?.name || 'Produkt'} entfernt`, 'info');
  };

  const handleUpdateQuantity = (idProduct, delta) => {
    updateQuantity(idProduct, delta);
    if (delta > 0) FeedbackService.triggerAdd();
  };

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterType !== 'All') {
      result = result.filter(item => (metadata[item.idProduct]?.type || 'Karte') === filterType);
    }

    // Sort
    result.sort((a, b) => {
      const metaA = metadata[a.idProduct] || {};
      const metaB = metadata[b.idProduct] || {};
      const priceA = prices[a.idProduct]?.trend || 0;
      const priceB = prices[b.idProduct]?.trend || 0;

      switch (sortBy) {
        case 'Value': {
          return (priceB * b.quantity) - (priceA * a.quantity);
        }
        case 'Profit': {
          const profitA = (priceA - (a.purchasePrice || 0)) * a.quantity;
          const profitB = (priceB - (b.purchasePrice || 0)) * b.quantity;
          return profitB - profitA;
        }
        case 'Name': {
          return (metaA.name || '').localeCompare(metaB.name || '');
        }
        case 'Date':
        default: {
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        }
      }
    });

    return result;
  }, [items, metadata, prices, filterType, sortBy]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="collection-controls" style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {['All', 'Karte', 'Sealed'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`filter-chip ${filterType === type ? 'active' : ''}`}
            >
              {type === 'All' ? 'Alle' : type}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="text-secondary" style={{ fontSize: '12px', fontWeight: '700' }}>
            {filteredItems.length} PRODUKTE GEFUNDEN
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpNarrowWide size={14} className="text-secondary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '12px', fontWeight: '700', outline: 'none' }}
              >
                <option value="Date">Datum</option>
                <option value="Value">Wert</option>
                <option value="Profit">Profit</option>
                <option value="Name">Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => {
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
                onUpdateQuantity={handleUpdateQuantity}
              />
            );
          })
        ) : (
          <div className="empty-collection text-center glass-panel" style={{ marginTop: '40px', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Nichts gefunden</h2>
            <p className="text-secondary" style={{ fontSize: '14px' }}>
              {items.length > 0 ? 'Passe deine Filter an.' : 'Füge Produkte über die Suche hinzu, um dein Portfolio zu tracken.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
