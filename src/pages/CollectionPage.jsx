import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { Filter, ArrowUpNarrowWide, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    const name = metadata[idProduct]?.name || 'Produkt';
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    showToast(`${name} entfernt`, 'danger');
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
      // default: date (recently added)
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="controls" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <div className="select-wrapper glass-panel" style={{ flex: 1, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpNarrowWide size={16} className="text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
          >
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="profit">Profit</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="select-wrapper glass-panel" style={{ flex: 1, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} className="text-secondary" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
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
            const meta = metadata[item.idProduct] || { idProduct: item.idProduct, name: 'Lade...', set: '', image: '⏳' };
            const price = prices[item.idProduct]?.trend || 0;
            return (
              <ProductListItem
                key={item.idProduct}
                product={meta}
                price={price}
                quantity={item.quantity}
                onRemove={handleRemove}
                onUpdateQuantity={updateQuantity}
              />
            );
          })
        ) : (
          <div className="empty-collection text-center glass-panel" style={{ marginTop: '40px', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🗃️</div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Deine Sammlung ist leer</h2>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Füge Produkte über die Suche hinzu, um dein Portfolio zu tracken.</p>
            <Link to="/cards" className="btn-icon" style={{ margin: '0 auto', textDecoration: 'none', width: 'auto', padding: '0 24px', gap: '8px' }}>
              <Search size={20} />
              <span>Produkte suchen</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
