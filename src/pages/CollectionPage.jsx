import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { Filter, SortAsc } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem } = useCollection();
  const [sortBy, setSortBy] = useState('date'); // date, value, name, profit
  const [filterType, setFilterType] = useState('all'); // all, Karte, Sealed

  const handleRemove = (idProduct) => {
    removeItem(idProduct);
    FeedbackService.triggerRemove();
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items].map(item => ({
      ...item,
      meta: metadata[item.idProduct] || { idProduct: item.idProduct, name: 'Lade...', set: '', type: 'Unbekannt' },
      price: prices[item.idProduct]?.trend || 0
    }));

    // Filter
    if (filterType !== 'all') {
      result = result.filter(item => item.meta.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
      if (sortBy === 'value') {
        return (b.price * b.quantity) - (a.price * a.quantity);
      }
      if (sortBy === 'name') {
        return a.meta.name.localeCompare(b.meta.name);
      }
      if (sortBy === 'profit') {
        const profitA = (a.price - (a.purchasePrice || 0)) * a.quantity;
        const profitB = (b.price - (b.purchasePrice || 0)) * b.quantity;
        return profitB - profitA;
      }
      return 0;
    });

    return result;
  }, [items, metadata, prices, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="filter-bar">
        <div className="select-wrapper">
          <Filter size={16} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="custom-select"
          >
            <option value="all">Alle Typen</option>
            <option value="Karte">Karten</option>
            <option value="Sealed">Sealed</option>
          </select>
        </div>
        <div className="select-wrapper">
          <SortAsc size={16} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="custom-select"
          >
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="name">Name</option>
            <option value="profit">Profit</option>
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
                price={item.price}
                quantity={item.quantity}
                onRemove={handleRemove}
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
