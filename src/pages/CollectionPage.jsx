import { useMemo, useState } from 'react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { ArrowUpDown, Filter } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem } = useCollection();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('value'); // value, profit, name, date
  const [filter, setFilter] = useState('All'); // All, Karte, Sealed

  const handleRemove = (idProduct) => {
    const item = items.find(i => i.idProduct === idProduct);
    const name = metadata[idProduct]?.name || 'Produkt';
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    showToast(`${name} entfernt`, 'error');
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filter !== 'All') {
      result = result.filter(item => {
        const meta = metadata[item.idProduct];
        return meta && meta.type === filter;
      });
    }

    // Sort
    result.sort((a, b) => {
      const metaA = metadata[a.idProduct] || {};
      const metaB = metadata[b.idProduct] || {};
      const priceA = prices[a.idProduct]?.trend || 0;
      const priceB = prices[b.idProduct]?.trend || 0;
      const valA = priceA * a.quantity;
      const valB = priceB * b.quantity;
      const profitA = valA - (a.purchasePrice || 0) * a.quantity;
      const profitB = valB - (b.purchasePrice || 0) * b.quantity;

      if (sortBy === 'value') return valB - valA;
      if (sortBy === 'profit') return profitB - profitA;
      if (sortBy === 'name') return (metaA.name || '').localeCompare(metaB.name || '');
      if (sortBy === 'date') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      return 0;
    });

    return result;
  }, [items, metadata, prices, sortBy, filter]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div style={{ padding: '0 16px', marginBottom: '20px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, border: '1px solid var(--glass-border)' }}>
            <ArrowUpDown size={16} className="text-accent" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', padding: '8px 0', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '600' }}
            >
              <option value="value">Wertvollste</option>
              <option value="profit">Höchster Gewinn</option>
              <option value="name">Alphabetisch</option>
              <option value="date">Zuletzt hinzugefügt</option>
            </select>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, border: '1px solid var(--glass-border)' }}>
            <Filter size={16} className="text-accent" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', padding: '8px 0', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '600' }}
            >
              <option value="All">Alle Typen</option>
              <option value="Karte">Karten</option>
              <option value="Sealed">Sealed</option>
            </select>
          </div>
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
              />
            );
          })
        ) : (
          <div className="empty-collection text-center" style={{ marginTop: '60px' }}>
             <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏟️</div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Keine Produkte gefunden</h2>
            <p className="text-secondary">Passe deine Filter an oder füge neue Produkte hinzu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
