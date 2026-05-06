import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { ArrowUpNarrowWide, Filter } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity, updatePurchasePrice } = useCollection();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    if (window.confirm('Möchtest du dieses Produkt wirklich entfernen?')) {
      removeItem(idProduct);
      FeedbackService.triggerRemove();
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items].map(item => {
      const meta = metadata[item.idProduct] || { type: 'Unbekannt', name: '' };
      const currentPrice = prices[item.idProduct]?.trend || 0;
      const profit = (currentPrice - (item.purchasePrice || 0)) * item.quantity;
      return { ...item, meta, currentPrice, profit };
    });

    // Filter
    if (filterType !== 'all') {
      result = result.filter(item => item.meta.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.dateAdded) - new Date(a.dateAdded);
      if (sortBy === 'value') return (b.currentPrice * b.quantity) - (a.currentPrice * a.quantity);
      if (sortBy === 'profit') return b.profit - a.profit;
      if (sortBy === 'name') return a.meta.name.localeCompare(b.meta.name);
      return 0;
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
            <Filter size={16} className="text-accent" /> Filter
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
            <ArrowUpNarrowWide size={16} className="text-accent" /> Sortierung
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="glass-panel"
            style={{ flex: 1, padding: '10px', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', borderRadius: '12px' }}
          >
            <option value="all">Alle Typen</option>
            <option value="Karte">Einzelkarten</option>
            <option value="Sealed">Sealed Produkte</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-panel"
            style={{ flex: 1, padding: '10px', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', borderRadius: '12px' }}
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
              product={item.meta.name ? item.meta : { ...item.meta, idProduct: item.idProduct, name: 'Lade...' }}
              price={item.currentPrice}
              quantity={item.quantity}
              purchasePrice={item.purchasePrice}
              onRemove={handleRemove}
              onUpdateQuantity={(id, delta) => updateQuantity(id, delta)}
              onUpdatePurchasePrice={(id, price) => updatePurchasePrice(id, price)}
            />
          ))
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
