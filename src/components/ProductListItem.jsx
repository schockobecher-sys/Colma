import { Plus, Minus, Trash2, ChevronRight } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  isSearch = false
}) {
  const { updateQuantity } = useCollection();
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';

  return (
    <div className="product-item">
      <div className="product-image">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = isCard ? '🔥' : '📦';
          }}
        />
        {isCard && <div className="holo-effect"></div>}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-meta">{product.set} • {isSearch ? 'Deutsch' : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); updateQuantity(product.idProduct, -1); }}
              aria-label="Menge verringern"
              style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'white', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >
              <Minus size={12} />
            </button>
            {quantity} Stück
            <button
              onClick={(e) => { e.stopPropagation(); updateQuantity(product.idProduct, 1); }}
              aria-label="Menge erhöhen"
              style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'white', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >
              <Plus size={12} />
            </button>
          </span>
        )}</div>
      </div>
      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div className="price-now">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {!isSearch && (
            <div className="text-secondary" style={{ fontSize: '10px' }}>
              {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Stk
            </div>
          )}
        </div>

        {isSearch ? (
          <button
            className="btn-icon"
            onClick={() => onAdd && onAdd(product)}
          >
            <Plus size={20} />
          </button>
        ) : onRemove ? (
          <button
            className="btn-icon"
            onClick={() => onRemove(product.idProduct)}
            style={{ background: 'transparent', border: 'none', color: 'var(--danger)', width: 'auto', boxShadow: 'none' }}
          >
            <Trash2 size={18} />
          </button>
        ) : (
          <ChevronRight size={16} className="text-secondary" />
        )}
      </div>
    </div>
  );
}
