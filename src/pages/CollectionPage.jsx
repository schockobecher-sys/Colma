import { useState, useMemo } from 'react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { ArrowUpNarrowWide, Filter } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity, updateItem } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'value', 'profit', 'name'
  const [filterType, setFilterType] = useState('all'); // 'all', 'Karte', 'Sealed'

  const handleRemove = (idProduct) => {
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    showToast('Aus Sammlung entfernt', 'info');
  };

  const handleUpdatePrice = (idProduct, newPrice) => {
    if (!isNaN(newPrice)) {
      updateItem(idProduct, { purchasePrice: newPrice });
      showToast('Einkaufspreis aktualisiert', 'success');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterType !== 'all') {
      result = result.filter(item => {
        const meta = metadata[item.idProduct];
        return meta?.type === filterType;
      });
    }

    // Sort
    result.sort((a, b) => {
      const metaA = metadata[a.idProduct] || {};
      const metaB = metadata[b.idProduct] || {};
      const priceA = prices[a.idProduct]?.trend || 0;
      const priceB = prices[b.idProduct]?.trend || 0;

      switch (sortBy) {
        case 'value':
          return (priceB * b.quantity) - (priceA * a.quantity);
        case 'profit': {
          const profitA = (priceA - (a.purchasePrice || 0)) * a.quantity;
          const profitB = (priceB - (b.purchasePrice || 0)) * b.quantity;
          return profitB - profitA;
        }
        case 'name':
          return (metaA.name || '').localeCompare(metaB.name || '');
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

      <div className="filters-container" style={{ padding: '0 16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            className={`filter-chip ${sortBy === 'date' ? 'active' : ''}`}
            onClick={() => setSortBy('date')}
          >
            <ArrowUpNarrowWide size={14} style={{ marginRight: '4px' }} /> Datum
          </button>
          <button
            className={`filter-chip ${sortBy === 'value' ? 'active' : ''}`}
            onClick={() => setSortBy('value')}
          >
             Wert
          </button>
          <button
            className={`filter-chip ${sortBy === 'profit' ? 'active' : ''}`}
            onClick={() => setSortBy('profit')}
          >
             Profit
          </button>
          <button
            className={`filter-chip ${sortBy === 'name' ? 'active' : ''}`}
            onClick={() => setSortBy('name')}
          >
             Name
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Alle
          </button>
          <button
            className={`filter-chip ${filterType === 'Karte' ? 'active' : ''}`}
            onClick={() => setFilterType('Karte')}
          >
            Karten
          </button>
          <button
            className={`filter-chip ${filterType === 'Sealed' ? 'active' : ''}`}
            onClick={() => setFilterType('Sealed')}
          >
            Sealed
          </button>
        </div>
      </div>

      <div className="product-list" style={{ padding: '0 16px' }}>
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map(item => {
            const meta = metadata[item.idProduct] || { idProduct: item.idProduct, name: 'Lade...', set: '' };
            const price = prices[item.idProduct]?.trend || 0;
            return (
              <ProductListItem
                key={item.idProduct}
                product={meta}
                price={price}
                quantity={item.quantity}
                purchasePrice={item.purchasePrice}
                onRemove={handleRemove}
                onUpdateQuantity={updateQuantity}
                onUpdatePrice={handleUpdatePrice}
              />
            );
          })
        ) : (
          <div className="empty-collection text-center" style={{ marginTop: '60px', padding: '0 40px' }}>
            <Filter size={48} className="text-secondary" style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Keine Produkte gefunden</h2>
            <p className="text-secondary" style={{ fontSize: '14px' }}>
              {items.length > 0 ? 'Passe deine Filter an oder füge neue Karten hinzu.' : 'Deine Sammlung ist noch leer.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
