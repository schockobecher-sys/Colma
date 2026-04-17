import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { Filter, SortAsc } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateItem } = useCollection();
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'

  const handleRemove = (idProduct) => {
    removeItem(idProduct);
    FeedbackService.triggerRemove();
  };

  const handleUpdateQuantity = (idProduct, delta) => {
    const item = items.find(i => i.idProduct === idProduct);
    if (item) {
      const newQuantity = Math.max(0, item.quantity + delta);
      if (newQuantity === 0) {
        handleRemove(idProduct);
      } else {
        updateItem(idProduct, { quantity: newQuantity });
      }
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterType !== 'All') {
      result = result.filter(item => metadata[item.idProduct]?.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      const metaA = metadata[a.idProduct] || {};
      const metaB = metadata[b.idProduct] || {};
      const priceA = (prices[a.idProduct]?.trend || 0);
      const priceB = (prices[b.idProduct]?.trend || 0);

      switch (sortBy) {
        case 'value':
          return (priceB * b.quantity) - (priceA * a.quantity);
        case 'profit':
          const profitA = (priceA - (a.purchasePrice || 0)) * a.quantity;
          const profitB = (priceB - (b.purchasePrice || 0)) * b.quantity;
          return profitB - profitA;
        case 'name':
          return (metaA.name || '').localeCompare(metaB.name || '');
        case 'date':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    return result;
  }, [items, metadata, prices, filterType, sortBy]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="filter-sort-bar">
        <div className="filter-chip">
          <Filter size={14} className="text-secondary" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="All">Alle Typen</option>
            <option value="Karte">Karten</option>
            <option value="Sealed">Sealed</option>
          </select>
        </div>

        <div className="filter-chip">
          <SortAsc size={14} className="text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="profit">Profit</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="results-list">
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
          <div className="empty-collection text-center" style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>{items.length > 0 ? 'Keine Treffer' : 'Deine Sammlung ist leer'}</h2>
            <p className="text-secondary">
              {items.length > 0
                ? 'Passe deine Filter an.'
                : 'Füge Produkte über die Suche hinzu, um dein Portfolio zu tracken.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
