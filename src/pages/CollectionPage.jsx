import { useMemo, useState } from 'react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { ArrowUpNarrowWide, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('date'); // 'value', 'profit', 'date', 'name'
  const [filterType, setFilterType] = useState('All'); // 'All', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    const name = metadata[idProduct]?.name || 'Produkt';
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    showToast(`${name} entfernt`, 'danger');
  };

  const handleUpdateQuantity = (idProduct, delta) => {
    updateQuantity(idProduct, delta);
    FeedbackService.vibrate(10);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filtering
    if (filterType !== 'All') {
      result = result.filter(item => metadata[item.idProduct]?.type === filterType);
    }

    // Sorting
    result.sort((a, b) => {
      const metaA = metadata[a.idProduct] || {};
      const metaB = metadata[b.idProduct] || {};
      const priceA = prices[a.idProduct]?.trend || 0;
      const priceB = prices[b.idProduct]?.trend || 0;

      if (sortBy === 'value') {
        return (priceB * b.quantity) - (priceA * a.quantity);
      }
      if (sortBy === 'profit') {
        const profitA = (priceA - (a.purchasePrice || 0)) * a.quantity;
        const profitB = (priceB - (b.purchasePrice || 0)) * b.quantity;
        return profitB - profitA;
      }
      if (sortBy === 'name') {
        return (metaA.name || '').localeCompare(metaB.name || '');
      }
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="collection-controls" style={{ padding: '0 16px 16px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '100%', appearance: 'none', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', padding: '10px 12px 10px 36px', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
          >
            <option value="date">Zuletzt hinzugefügt</option>
            <option value="value">Höchster Wert</option>
            <option value="profit">Höchster Gewinn</option>
            <option value="name">Name A-Z</option>
          </select>
          <ArrowUpNarrowWide size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        </div>

        <div style={{ position: 'relative', flex: 1 }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '100%', appearance: 'none', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', padding: '10px 12px 10px 36px', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
          >
            <option value="All">Alle Typen</option>
            <option value="Karte">Einzelkarten</option>
            <option value="Sealed">Sealed Produkte</option>
          </select>
          <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
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
                onUpdateQuantity={handleUpdateQuantity}
              />
            );
          })
        ) : (
          <div className="empty-collection text-center" style={{ marginTop: '60px', padding: '0 20px' }}>
            <div className="pokeball-loader" style={{ marginBottom: '24px', animation: 'none', opacity: 0.5 }}></div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>{items.length === 0 ? 'Deine Sammlung ist leer' : 'Keine passenden Produkte'}</h2>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>
              {items.length === 0
                ? 'Füge Produkte über die Suche hinzu, um dein Portfolio zu tracken.'
                : 'Passe deine Filter an, um mehr Produkte zu sehen.'}
            </p>
            {items.length === 0 && (
              <Link to="/cards" className="btn-icon" style={{ width: 'auto', padding: '0 24px', textDecoration: 'none', color: '#000', gap: '8px', margin: '0 auto' }}>
                <Plus size={20} /> Produkte suchen
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
