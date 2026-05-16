import { Plus, Minus, Trash2, Heart, Edit2 } from 'lucide-react';
import { useState } from 'react';

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
  wishlist = [],
  isSearch = false
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';
  const isWishlisted = wishlist.includes(product.idProduct);

  const profit = !isSearch ? (price - (purchasePrice || 0)) * quantity : 0;

  return (
    <div className="product-item">
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
          }}
        />
        {isCard && <div className="holo-effect"></div>}
      </div>

      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-meta">
          {product.set} {isSearch ? '• Deutsch' : ''}
        </div>
        {!isSearch && (
          <div className="product-profit" style={{ fontSize: '11px', marginTop: '4px' }}>
            EK: {purchasePrice?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} •
            <span className={profit >= 0 ? 'text-success' : 'text-danger'}>
              {profit >= 0 ? ' +' : ' '}{profit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        )}
      </div>

      <div className="product-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <div className="price-now">
          {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSearch ? (
            <>
              <button
                className="btn-icon"
                onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product.idProduct); }}
                style={{ background: 'transparent', boxShadow: 'none' }}
              >
                <Heart size={20} className={isWishlisted ? 'text-danger' : 'text-secondary'} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button className="btn-icon" onClick={() => onAdd && onAdd(product)}>
                <Plus size={20} />
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '2px' }}>
                <button
                  className="btn-icon"
                  style={{ width: '28px', height: '28px', background: 'transparent', boxShadow: 'none', justifyContent: 'center' }}
                  onClick={() => onUpdateQuantity?.(product.idProduct, -1)}
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}>{quantity}</span>
                <button
                  className="btn-icon"
                  style={{ width: '28px', height: '28px', background: 'transparent', boxShadow: 'none', justifyContent: 'center' }}
                  onClick={() => onUpdateQuantity?.(product.idProduct, 1)}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                className="btn-icon"
                style={{ width: '32px', height: '32px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', boxShadow: 'none' }}
                onClick={() => {
                  const newPrice = prompt('Neuer Einkaufspreis (€):', purchasePrice || price);
                  if (newPrice !== null) onUpdatePrice?.(product.idProduct, parseFloat(newPrice.replace(',', '.')));
                }}
              >
                <Edit2 size={14} />
              </button>

              <button
                className="btn-icon"
                onClick={() => onRemove?.(product.idProduct)}
                style={{ width: '32px', height: '32px', background: 'transparent', border: 'none', color: 'var(--danger)', boxShadow: 'none' }}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
