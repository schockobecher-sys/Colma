import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { useState, useMemo } from 'react';
import { ArrowUpNarrowWide, Filter, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('all');

  const handleRemove = (idProduct) => {
    const meta = metadata[idProduct];
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    showToast(`${meta?.name || 'Produkt'} entfernt`, 'danger');
  };

  const handleUpdateQuantity = (idProduct, delta) => {
    updateQuantity(idProduct, delta);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterType !== 'all') {
      result = result.filter(item => metadata[item.idProduct]?.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      const priceA = (prices[a.idProduct]?.trend || 0) * a.quantity;
      const priceB = (prices[b.idProduct]?.trend || 0) * b.quantity;
      const metaA = metadata[a.idProduct];
      const metaB = metadata[b.idProduct];

      if (sortBy === 'value') return priceB - priceA;
      if (sortBy === 'name') return (metaA?.name || '').localeCompare(metaB?.name || '');
      if (sortBy === 'profit') {
        const profitA = priceA - (a.purchasePrice || 0) * a.quantity;
        const profitB = priceB - (b.purchasePrice || 0) * b.quantity;
        return profitB - profitA;
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

      <div className="controls-bar" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '10px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <div className="select-wrapper glass-panel" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpNarrowWide size={16} className="text-accent" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: '600', outline: 'none' }}>
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="profit">Gewinn</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="select-wrapper glass-panel" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} className="text-accent-secondary" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: '600', outline: 'none' }}>
            <option value="all">Alle</option>
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
                onUpdateQuantity={(delta) => handleUpdateQuantity(item.idProduct, delta)}
              />
            );
          })
        ) : (
          <div className="empty-collection text-center glass-panel" style={{ marginTop: '40px', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🗃️</div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Sammlung leer</h2>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Füge Produkte hinzu, um dein Portfolio zu tracken.</p>
            <Link to="/cards" className="btn-icon" style={{ width: 'auto', padding: '0 24px', margin: '0 auto', gap: '8px', textDecoration: 'none' }}>
              <PlusCircle size={20} /> <span style={{ fontWeight: '800' }}>Jetzt suchen</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
