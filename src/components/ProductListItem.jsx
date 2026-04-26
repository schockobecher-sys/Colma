import { Plus, ChevronRight } from 'lucide-react';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onUpdateQuantity,
  isSearch = false
}) {
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
        <div className="product-meta">{product.set} • {isSearch ? 'Deutsch' : `${quantity} Stück`}</div>
      </div>
      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isSearch && onUpdateQuantity && (
          <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '4px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.idProduct, -1); }}
              style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '4px' }}
            >
              -
            </button>
            <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '16px', textAlign: 'center' }}>{quantity}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.idProduct, 1); }}
              style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '4px' }}
            >
              +
            </button>
          </div>
        )}

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
        ) : (
          <ChevronRight size={16} className="text-secondary" />
        )}
      </div>
    </div>
  );
}
