import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { useMemo, useState } from 'react';
import { ArrowDownAZ, ArrowUpNarrowWide, Filter } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem } = useCollection();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    removeItem(idProduct);
    FeedbackService.triggerRemove();
  };

  const processedItems = useMemo(() => {
    let result = [...items].map(item => {
      const meta = metadata[item.idProduct] || { name: '', type: '', set: '' };
      const currentPrice = prices[item.idProduct]?.trend || 0;
      const totalValue = currentPrice * item.quantity;
      const purchaseValue = (item.purchasePrice || 0) * item.quantity;
      return {
        ...item,
        meta,
        currentPrice,
        totalValue,
        profit: totalValue - purchaseValue
      };
    });

    // Filtering
    if (filterType !== 'all') {
      result = result.filter(item => item.meta.type === filterType);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.meta.name.localeCompare(b.meta.name);
        case 'value':
          return b.totalValue - a.totalValue;
        case 'profit':
          return b.profit - a.profit;
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
        <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <ArrowUpNarrowWide size={14} className="text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '12px', fontWeight: '700', outline: 'none' }}
          >
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="profit">Gewinn</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <Filter size={14} className="text-secondary" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '12px', fontWeight: '700', outline: 'none' }}
          >
            <option value="all">Alle Typen</option>
            <option value="Karte">Karten</option>
            <option value="Sealed">Sealed</option>
          </select>
        </div>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {processedItems.length > 0 ? (
          processedItems.map(item => (
            <ProductListItem
              key={item.idProduct}
              product={item.meta.idProduct ? item.meta : { ...item.meta, idProduct: item.idProduct }}
              price={item.currentPrice}
              quantity={item.quantity}
              onRemove={handleRemove}
            />
          ))
        ) : (
          <div className="empty-collection text-center" style={{ marginTop: '60px' }}>
            <div className="pokeball-loader" style={{ animation: 'none', borderOpacity: 0.2, marginBottom: '20px' }}></div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Keine Einträge gefunden</h2>
            <p className="text-secondary">Passe deine Filter an oder füge neue Produkte hinzu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
