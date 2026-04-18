import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity } = useCollection();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    removeItem(idProduct);
    FeedbackService.triggerRemove();
  };

  const handleUpdateQuantity = (idProduct, delta) => {
    updateQuantity(idProduct, delta);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items].map(item => {
      const meta = metadata[item.idProduct] || {};
      const price = prices[item.idProduct]?.trend || 0;
      return {
        ...item,
        meta,
        currentPrice: price,
        totalValue: price * item.quantity,
        profit: (price - (item.purchasePrice || 0)) * item.quantity
      };
    });

    // Filtering
    if (filterType !== 'all') {
      result = result.filter(item => item.meta.type === filterType);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.totalValue - a.totalValue;
        case 'profit':
          return b.profit - a.profit;
        case 'name':
          return (a.meta.name || '').localeCompare(b.meta.name || '');
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

      <div className="filters-bar" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px 12px', gap: '8px', fontSize: '13px', border: '1px solid var(--border)' }}>
          <ArrowUpDown size={14} className="text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontWeight: 600 }}
          >
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="profit">Profit</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px 12px', gap: '8px', fontSize: '13px', border: '1px solid var(--border)' }}>
          <SlidersHorizontal size={14} className="text-secondary" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontWeight: 600 }}
          >
            <option value="all">Alle Typen</option>
            <option value="Karte">Karten</option>
            <option value="Sealed">Sealed</option>
          </select>
        </div>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map(item => {
            return (
              <ProductListItem
                key={item.idProduct}
                product={item.meta}
                price={item.currentPrice}
                quantity={item.quantity}
                onRemove={handleRemove}
                onUpdateQuantity={(delta) => handleUpdateQuantity(item.idProduct, delta)}
              />
            );
          })
        ) : items.length > 0 ? (
          <div className="text-center text-secondary glass-panel" style={{ marginTop: '40px', padding: '40px 20px' }}>
            <SlidersHorizontal size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <div style={{ fontWeight: 700, color: 'white', marginBottom: '8px' }}>Keine Treffer</div>
            <p style={{ fontSize: '14px' }}>Keine Produkte entsprechen den gewählten Filtern.</p>
            <button
              onClick={() => { setFilterType('all'); setSortBy('date'); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 700, marginTop: '16px', cursor: 'pointer' }}
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="empty-collection text-center glass-panel" style={{ marginTop: '40px', padding: '60px 20px' }}>
            <div className="pokeball-loader" style={{ animation: 'none', borderOpacity: 0.2, marginBottom: '24px' }}></div>
            <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'white' }}>Deine Sammlung ist leer</h2>
            <p className="text-secondary" style={{ fontSize: '14px', maxWidth: '280px', margin: '0 auto 24px' }}>
              Füge Produkte über die Suche hinzu, um dein Portfolio zu tracken und den Wert deiner Karten zu beobachten.
            </p>
            <Link to="/cards" className="view-all" style={{ padding: '12px 24px', fontSize: '14px' }}>
              Jetzt Karten suchen
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
