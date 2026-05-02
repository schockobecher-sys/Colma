import { Plus, Minus, Trash2, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';

  if (isLoading) {
    return (
      <div className="product-item skeleton">
        <div className="product-image skeleton-box"></div>
        <div className="product-info">
          <div className="skeleton-line" style={{ width: '80%', height: '16px', marginBottom: '8px' }}></div>
          <div className="skeleton-line" style={{ width: '40%', height: '12px' }}></div>
        </div>
        <div className="product-actions">
          <div className="skeleton-line" style={{ width: '50px', height: '20px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-item">
      <div className="product-image">
        {!imgLoaded && <div className="skeleton-box" style={{ position: 'absolute', inset: 0 }}></div>}
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            setImgLoaded(true);
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
            aria-label="Hinzufügen"
          >
            <Plus size={20} />
          </button>
        ) : onRemove ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '2px' }}>
              <button
                className="qty-btn"
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity && onUpdateQuantity(product.idProduct, -1); }}
                style={{ background: 'transparent', border: 'none', color: 'white', padding: '4px', display: 'flex' }}
                aria-label="Verringern"
              >
                <Minus size={14} />
              </button>
              <button
                className="qty-btn"
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity && onUpdateQuantity(product.idProduct, 1); }}
                style={{ background: 'transparent', border: 'none', color: 'white', padding: '4px', display: 'flex' }}
                aria-label="Erhöhen"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              className="btn-icon-danger"
              onClick={(e) => { e.stopPropagation(); onRemove(product.idProduct); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', display: 'flex', padding: '4px' }}
              aria-label="Entfernen"
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
