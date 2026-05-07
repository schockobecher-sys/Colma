import { Plus, Trash2, ChevronRight } from 'lucide-react';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  onUpdateQuantity,
  onUpdatePrice,
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
        <div style={{ textAlign: 'right' }}>
          <div className="price-now">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {!isSearch && (
            <div
              className="text-secondary"
              style={{ fontSize: '10px', cursor: onUpdatePrice ? 'pointer' : 'default', textDecoration: onUpdatePrice ? 'underline' : 'none' }}
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePrice && onUpdatePrice();
              }}
            >
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onUpdateQuantity && (
              <div className="quantity-controls" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  className="qty-btn"
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(1); }}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', padding: '0 4px', fontSize: '10px' }}
                >
                  +
                </button>
                <button
                  className="qty-btn"
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(-1); }}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', padding: '0 4px', fontSize: '10px' }}
                >
                  -
                </button>
              </div>
            )}
            <button
              className="btn-icon"
              onClick={(e) => { e.stopPropagation(); onRemove(product.idProduct); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', width: 'auto', boxShadow: 'none', padding: '4px' }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : (
          <ChevronRight size={16} className="text-secondary" />
        )}
      </div>
    </div>
  );
}
