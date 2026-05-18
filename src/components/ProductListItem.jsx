import { useState } from 'react';
import { Plus, Minus, Trash2, ChevronRight, Heart, Edit3 } from 'lucide-react';

export default function ProductListItem({
  product,
  price,
  quantity,
  purchasePrice,
  onAdd,
  onRemove,
  onUpdateQuantity,
  onUpdatePrice,
  onToggleWishlist,
  isWishlisted = false,
  isSearch = false
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';

  return (
    <div className="product-item" style={{ animation: 'slideUp 0.4s ease-out backwards' }}>
      <div className={`product-image ${!imageLoaded ? 'skeleton' : ''}`}>
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = isCard ? '🔥' : '📦';
            setImageLoaded(true);
          }}
          style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
        {isCard && <div className="holo-effect"></div>}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-meta">
          {product.set} • {isSearch ? 'Deutsch' : `${quantity} Stück`}
          {!isSearch && purchasePrice !== undefined && (
            <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
              EK: {purchasePrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          )}
        </div>
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-icon"
              onClick={() => onToggleWishlist && onToggleWishlist(product)}
              style={{ background: 'transparent', boxShadow: 'none' }}
            >
              <Heart size={20} className={isWishlisted ? 'text-danger' : 'text-secondary'} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              className="btn-icon"
              onClick={() => onAdd && onAdd(product)}
            >
              <Plus size={20} />
            </button>
          </div>
        ) : onRemove ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <button onClick={() => onUpdateQuantity && onUpdateQuantity(product.idProduct, -1)} style={{ padding: '4px 8px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
              <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => onUpdateQuantity && onUpdateQuantity(product.idProduct, 1)} style={{ padding: '4px 8px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
            </div>
            <button
              className="btn-icon"
              onClick={() => {
                const newPrice = prompt('Neuer Einkaufspreis (€):', purchasePrice || price);
                if (newPrice !== null) {
                  onUpdatePrice && onUpdatePrice(product.idProduct, parseFloat(newPrice.replace(',', '.')));
                }
              }}
              style={{ background: 'transparent', boxShadow: 'none', color: 'var(--text-secondary)' }}
            >
              <Edit3 size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={() => onRemove(product.idProduct)}
              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', width: 'auto', boxShadow: 'none' }}
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
