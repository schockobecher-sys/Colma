import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { ArrowUpNarrowWide, Filter } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity, updateItem } = useCollection();
  const { addToast } = useToast();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    const name = metadata[idProduct]?.name || 'Produkt';
    if (confirm(`Möchtest du ${name} wirklich entfernen?`)) {
      removeItem(idProduct);
      FeedbackService.triggerRemove();
      addToast(`${name} entfernt`, 'info');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items].map(item => {
      const meta = metadata[item.idProduct] || { type: 'Unbekannt', name: '' };
      const currentPrice = prices[item.idProduct]?.trend || 0;
      const totalValue = currentPrice * item.quantity;
      const totalPurchase = (item.purchasePrice || 0) * item.quantity;
      return { ...item, meta, currentPrice, totalValue, totalPurchase, profit: totalValue - totalPurchase };
    });

    // Filter
    if (filterType !== 'all') {
      result = result.filter(item => item.meta.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'value': return b.totalValue - a.totalValue;
        case 'profit': return b.profit - a.profit;
        case 'name': return a.meta.name.localeCompare(b.meta.name);
        case 'date': default: return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="filters-bar" style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '12px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <ArrowUpNarrowWide size={16} className="text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '14px', outline: 'none' }}
          >
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="profit">Profit</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <Filter size={16} className="text-secondary" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '14px', outline: 'none' }}
          >
            <option value="all">Alle Typen</option>
            <option value="Karte">Karten</option>
            <option value="Sealed">Sealed</option>
          </select>
        </div>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map(item => (
            <ProductListItem
              key={item.idProduct}
              product={item.meta}
              price={item.currentPrice}
              quantity={item.quantity}
              purchasePrice={item.purchasePrice}
              onRemove={handleRemove}
              onUpdateQuantity={updateQuantity}
              onUpdatePrice={(id, price) => updateItem(id, { purchasePrice: price })}
            />
          ))
        ) : (
          <div className="empty-collection text-center" style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>{items.length === 0 ? 'Deine Sammlung ist leer' : 'Keine Treffer für Filter'}</h2>
            <p className="text-secondary">Füge Produkte über die Suche hinzu, um dein Portfolio zu tracken.</p>
          </div>
        )}
      </div>
    </div>
  );
}
