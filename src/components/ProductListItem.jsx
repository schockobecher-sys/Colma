import { Plus, Minus, Trash2, ChevronRight, Heart, Edit2 } from 'lucide-react';
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
  isSearch = false,
  isLoading = false
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product?.idProduct}.jpg`;
  const isCard = product?.type === 'Karte';
  const isInWishlist = wishlist.includes(product?.idProduct);

  if (isLoading || !product) {
    return (
      <div className="product-item skeleton">
        <div className="product-image skeleton-box" style={{ width: '56px', height: '56px' }}></div>
        <div className="product-info">
          <div className="skeleton-box" style={{ width: '120px', height: '16px', marginBottom: '8px' }}></div>
          <div className="skeleton-box" style={{ width: '80px', height: '12px' }}></div>
        </div>
      </div>
    );
  }

  const handleEditPrice = (e) => {
    e.stopPropagation();
    const newPrice = prompt(`Neuen Einkaufspreis für ${product.name} eingeben:`, purchasePrice || price);
    if (newPrice !== null) {
      const parsed = parseFloat(newPrice.replace(',', '.'));
      if (!isNaN(parsed)) {
        onUpdatePrice(product.idProduct, parsed);
      }
    }
  };

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
            setImageLoaded(true);
          }}
        />
        {isCard && imageLoaded && <div className="holo-effect"></div>}
      </div>

      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-meta">
          {product.set} • {isSearch ? 'Deutsch' : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.idProduct, -1); }} style={{ background: 'none', color: 'inherit', padding: '2px', display: 'flex', justifyContent: 'center' }}><Minus size={12} /></button>
              {quantity}
              <button onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.idProduct, 1); }} style={{ background: 'none', color: 'inherit', padding: '2px', display: 'flex', justifyContent: 'center' }}><Plus size={12} /></button>
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
            <div className="text-secondary" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
              EK: {purchasePrice?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '---'}
              <button onClick={handleEditPrice} style={{ background: 'none', color: 'inherit', padding: 0 }}><Edit2 size={10} /></button>
            </div>
          )}
        </div>

        {isSearch ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="wishlist-btn"
              onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.idProduct); }}
              style={{ background: 'none', border: 'none', color: isInWishlist ? 'var(--poke-red)' : 'var(--text-secondary)' }}
            >
              <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              className="btn-icon"
              onClick={() => onAdd && onAdd(product)}
            >
              <Plus size={20} />
            </button>
          </div>
        ) : onRemove ? (
          <button
            className="btn-icon-remove"
            onClick={(e) => { e.stopPropagation(); onRemove(product.idProduct); }}
            style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '8px' }}
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
