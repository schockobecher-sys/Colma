import { useCollection } from '../context/CollectionContext';
import ProductListItem from '../components/ProductListItem';
import { LayoutGrid, List, SortAsc, TrendingUp, Package } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, getStats } = useCollection();
  const [viewMode, setViewMode] = useState('list'); // list or grid
  const [sortBy, setSortBy] = useState('value'); // value, name, date

  const stats = getStats();

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === 'value') {
        const valA = (prices[a.idProduct]?.trend || 0) * a.quantity;
        const valB = (prices[b.idProduct]?.trend || 0) * b.quantity;
        return valB - valA;
      }
      if (sortBy === 'name') {
        const nameA = metadata[a.idProduct]?.name || '';
        const nameB = metadata[b.idProduct]?.name || '';
        return nameA.localeCompare(nameB);
      }
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    });
  }, [items, prices, metadata, sortBy]);

  return (
    <div className="collection-page fade-in">
      <header className="app-header">
        <h1 className="app-title">Sammlung<span>XP</span></h1>
      </header>

      <div style={{ padding: '0 16px' }}>
          <div className="stat-box" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                      <div className="stat-label">Sammlungswert</div>
                      <div className="stat-value" style={{ fontSize: '28px', color: 'var(--pk-yellow)' }}>
                          {stats.totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </div>
                  </div>
                  <TrendingUp size={32} className="text-success" style={{ opacity: 0.5 }} />
              </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setSortBy('value')}
                    className={`btn-icon ${sortBy === 'value' ? 'active' : ''}`}
                    style={{ width: 'auto', padding: '0 12px', fontSize: '12px', background: sortBy === 'value' ? 'var(--pk-blue)' : '' }}
                  >
                    Wert
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`btn-icon ${sortBy === 'name' ? 'active' : ''}`}
                    style={{ width: 'auto', padding: '0 12px', fontSize: '12px', background: sortBy === 'name' ? 'var(--pk-blue)' : '' }}
                  >
                    Name
                  </button>
                  <button
                    onClick={() => setSortBy('date')}
                    className={`btn-icon ${sortBy === 'date' ? 'active' : ''}`}
                    style={{ width: 'auto', padding: '0 12px', fontSize: '12px', background: sortBy === 'date' ? 'var(--pk-blue)' : '' }}
                  >
                    <SortAsc size={14} />
                  </button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setViewMode('list')} className="btn-icon" style={{ background: viewMode === 'list' ? 'var(--bg-tertiary)' : '' }}>
                      <List size={18} />
                  </button>
                  <button onClick={() => setViewMode('grid')} className="btn-icon" style={{ background: viewMode === 'grid' ? 'var(--bg-tertiary)' : '' }}>
                      <LayoutGrid size={18} />
                  </button>
              </div>
          </div>

          <div className={viewMode === 'grid' ? 'grid-2' : 'product-list'}>
            {sortedItems.map(item => (
              <ProductListItem
                key={item.idProduct}
                product={metadata[item.idProduct] || { idProduct: item.idProduct, name: 'Lade...' }}
                price={prices[item.idProduct]?.trend || 0}
                quantity={item.quantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center" style={{ marginTop: '100px', opacity: 0.5 }}>
                <Package size={64} style={{ marginBottom: '16px' }} />
                <p>Deine Sammlung ist noch leer.</p>
            </div>
          )}
      </div>
    </div>
  );
}
