import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';
import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';

export default function CollectionPage() {
  const { items, metadata, prices, removeItem, updateQuantity, updatePurchasePrice } = useCollection();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, value, profit, name
  const [filterType, setFilterType] = useState('all'); // all, Karte, Sealed

  const handleRemove = (idProduct) => {
    const name = metadata[idProduct]?.name || 'Produkt';
    removeItem(idProduct);
    FeedbackService.triggerRemove();
    addToast(`${name} entfernt`, 'error');
  };

  const handleUpdateQuantity = (idProduct, delta) => {
    updateQuantity(idProduct, delta);
    if (delta > 0) FeedbackService.triggerAdd();
    else FeedbackService.triggerRemove();
  };

  const handleUpdatePurchasePrice = (idProduct, newPrice) => {
    updatePurchasePrice(idProduct, newPrice);
    addToast('Einkaufspreis aktualisiert');
  };

  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter(item => {
        const meta = metadata[item.idProduct];
        if (!meta) return true;
        const matchesSearch = meta.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || meta.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const metaA = metadata[a.idProduct] || {};
        const metaB = metadata[b.idProduct] || {};
        const priceA = prices[a.idProduct]?.trend || 0;
        const priceB = prices[b.idProduct]?.trend || 0;
        const profitA = (priceA - (a.purchasePrice || 0)) * a.quantity;
        const profitB = (priceB - (b.purchasePrice || 0)) * b.quantity;

        if (sortBy === 'name') return metaA.name?.localeCompare(metaB.name);
        if (sortBy === 'value') return (priceB * b.quantity) - (priceA * a.quantity);
        if (sortBy === 'profit') return profitB - profitA;
        if (sortBy === 'date') return new Date(b.dateAdded) - new Date(a.dateAdded);
        return 0;
      });
  }, [items, metadata, prices, searchTerm, sortBy, filterType]);

  return (
    <div className="collection-page">
      <header className="app-header">
        <h1 className="app-title">Sammlung</h1>
      </header>

      <div className="collection-controls" style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div className="search-input-wrapper" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Search size={18} className="text-secondary" />
          <input
            type="text"
            placeholder="In Sammlung suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
          >
            <option value="date">Datum</option>
            <option value="value">Wert</option>
            <option value="profit">Profit</option>
            <option value="name">Name</option>
          </select>

          <button
            onClick={() => setFilterType('all')}
            style={{
              background: filterType === 'all' ? 'var(--accent)' : 'var(--bg-secondary)',
              color: filterType === 'all' ? '#000' : 'white',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              border: '1px solid var(--border)'
            }}
          >Alle</button>
          <button
            onClick={() => setFilterType('Karte')}
            style={{
              background: filterType === 'Karte' ? 'var(--accent)' : 'var(--bg-secondary)',
              color: filterType === 'Karte' ? '#000' : 'white',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              border: '1px solid var(--border)'
            }}
          >Karten</button>
          <button
            onClick={() => setFilterType('Sealed')}
            style={{
              background: filterType === 'Sealed' ? 'var(--accent)' : 'var(--bg-secondary)',
              color: filterType === 'Sealed' ? '#000' : 'white',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              border: '1px solid var(--border)'
            }}
          >Sealed</button>
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
                purchasePrice={item.purchasePrice}
                onRemove={handleRemove}
                onUpdateQuantity={handleUpdateQuantity}
                onUpdatePurchasePrice={handleUpdatePurchasePrice}
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
