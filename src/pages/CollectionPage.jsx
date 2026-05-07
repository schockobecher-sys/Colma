import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { useState, useMemo } from 'react';
import { ArrowUpNarrowWide, Filter } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity, updatePurchasePrice } = useCollection();
  const [sortBy, setSortBy] = useState('date'); // date, value, profit, name
  const [filterType, setFilterType] = useState('all'); // all, Karte, Sealed

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
      if (sortBy === 'value') {
        return (b.currentPrice * b.quantity) - (a.currentPrice * a.quantity);
      }
      if (sortBy === 'profit') {
        const profitA = (a.currentPrice - a.purchasePrice) * a.quantity;
        const profitB = (b.currentPrice - b.purchasePrice) * b.quantity;
        return profitB - profitA;
      }
      if (sortBy === 'name') {
        return a.meta.name.localeCompare(b.meta.name);
      }
      // Default: date (newest first)
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'nowrap' }}>
            <ArrowUpNarrowWide size={16} /> Sortierung:
          </div>
          {['date', 'value', 'profit', 'name'].map(sort => (
            <button
              key={sort}
              className={`filter-chip ${sortBy === sort ? 'active' : ''}`}
              onClick={() => setSortBy(sort)}
              style={{ fontSize: '12px' }}
            >
              {sort === 'date' ? 'Datum' : sort === 'value' ? 'Wert' : sort === 'profit' ? 'Profit' : 'Name'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'nowrap' }}>
            <Filter size={16} /> Filter:
          </div>
          {['all', 'Karte', 'Sealed'].map(type => (
            <button
              key={type}
              className={`filter-chip ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
              style={{ fontSize: '12px' }}
            >
              {type === 'all' ? 'Alle' : type}
            </button>
          ))}
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
              onRemove={handleRemove}
              onUpdateQuantity={(delta) => updateQuantity(item.idProduct, delta)}
              onUpdatePrice={() => {
                const newPrice = prompt('Neuer Einkaufspreis (€):', item.purchasePrice);
                if (newPrice !== null) updatePurchasePrice(item.idProduct, newPrice);
              }}
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
