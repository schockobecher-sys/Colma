import { Plus, Minus, Trash2, ChevronRight } from 'lucide-react';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  onUpdateQuantity,
  isSearch = false,
  isLoading = false
}) {
  if (isLoading) {
    return (
      <div className="product-item loading-skeleton">
        <div className="product-image skeleton-box" style={{ width: '56px', height: '56px' }}></div>
        <div className="product-info">
          <div className="skeleton-box" style={{ width: '60%', height: '16px', marginBottom: '8px' }}></div>
          <div className="skeleton-box" style={{ width: '40%', height: '12px' }}></div>
        </div>
        <div className="product-price">
          <div className="skeleton-box" style={{ width: '40px', height: '16px' }}></div>
        </div>
      </div>
    );
  }

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
            <div className="text-secondary" style={{ fontSize: '10px' }}>
              {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Stk
            </div>
          )}
        </div>

        {isSearch ? (
          <button
            className="btn-icon"
            onClick={(e) => { e.stopPropagation(); onAdd && onAdd(product); }}
          >
            <Plus size={20} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onUpdateQuantity && (
              <div className="quantity-controls glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(-1); }}
                  style={{ background: 'transparent', color: 'white', padding: '2px', opacity: quantity <= 1 ? 0.3 : 1 }}
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontSize: '12px', fontWeight: '800', minWidth: '16px', textAlign: 'center' }}>{quantity}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(1); }}
                  style={{ background: 'transparent', color: 'white', padding: '2px' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
            {onRemove ? (
              <button
                className="btn-icon"
                onClick={(e) => { e.stopPropagation(); onRemove(product.idProduct); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', width: 'auto', boxShadow: 'none', padding: '4px' }}
              >
                <Trash2 size={18} />
              </button>
            ) : (
              <ChevronRight size={16} className="text-secondary" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
