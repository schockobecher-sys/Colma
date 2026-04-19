import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { useState, useMemo } from 'react';
import { Filter, SortAsc } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem } = useCollection();
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'

  const handleRemove = (idProduct) => {
    removeItem(idProduct);
    FeedbackService.triggerRemove();
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items].map(item => {
      const meta = metadata[item.idProduct] || { idProduct: item.idProduct, name: 'Lade...', set: '', type: 'Karte' };
      const currentPrice = prices[item.idProduct]?.trend || 0;
      const totalValue = currentPrice * item.quantity;
      const totalProfit = (currentPrice - (item.purchasePrice || 0)) * item.quantity;
      return { ...item, meta, currentPrice, totalValue, totalProfit };
    });

    // Filtering
    if (filter !== 'All') {
      result = result.filter(item => item.meta.type === filter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'value') return b.totalValue - a.totalValue;
      if (sortBy === 'profit') return b.totalProfit - a.totalProfit;
      if (sortBy === 'name') return a.meta.name.localeCompare(b.meta.name);
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

    return result;
  }, [items, metadata, prices, filter, sortBy]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div style={{ padding: '0 16px', marginBottom: '24px', display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <Filter size={16} className="text-secondary" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '14px' }}
          >
            <option value="All">Alle Typen</option>
            <option value="Karte">Karten</option>
            <option value="Sealed">Sealed</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <SortAsc size={16} className="text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '14px' }}
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
              product={item.meta}
              price={prices[item.idProduct]?.trend || 0}
              quantity={item.quantity}
              onRemove={handleRemove}
            />
          ))
        ) : (
          <div className="empty-collection text-center" style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Keine Produkte gefunden</h2>
            <p className="text-secondary">Passe deine Filter an oder füge Produkte über die Suche hinzu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
