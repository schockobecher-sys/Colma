import { Plus, Minus, Trash2, Heart, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useCollection } from '../context/CollectionContext';

export default function ProductListItem({
  product,
  price,
  quantity,
  purchasePrice,
  onAdd,
  onRemove,
  onUpdateQuantity,
  onToggleWishlist,
  wishlist = [],
  isSearch = false,
  isLoading = false
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { updateItem } = useCollection();

  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';
  const isInWishlist = wishlist.includes(product.idProduct);

  const handleEditPrice = (e) => {
    e.stopPropagation();
    const newPrice = prompt('Neuer Einkaufspreis (€):', purchasePrice || price);
    if (newPrice !== null) {
      const val = parseFloat(newPrice.replace(',', '.'));
      if (!isNaN(val)) {
        updateItem(product.idProduct, { purchasePrice: val });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="product-item skeleton">
        <div className="product-image skeleton-pulse"></div>
        <div className="product-info">
          <div className="skeleton-line skeleton-pulse" style={{ width: '80%' }}></div>
          <div className="skeleton-line skeleton-pulse" style={{ width: '40%' }}></div>
        </div>
        <div className="product-price">
          <div className="skeleton-line skeleton-pulse" style={{ width: '50px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-item">
      <div className={`product-image ${!imageLoaded ? 'skeleton' : ''}`}>
        <img
          src={imageUrl}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = isCard ? '🔥' : '📦';
            setImageLoaded(true);
          }}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        {isCard && <div className="holo-effect"></div>}
      </div>

      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-meta">
          {product.set} • {isSearch ? 'Deutsch' : `${quantity}x`}
        </div>
        {!isSearch && purchasePrice !== undefined && (
          <div className="product-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            EK: {purchasePrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            <button onClick={handleEditPrice} className="text-secondary" style={{ background: 'transparent', padding: 0 }}>
              <Edit2 size={10} />
            </button>
          </div>
        )}
      </div>

      <div className="product-actions">
        <div style={{ textAlign: 'right', marginBottom: isSearch ? 0 : '8px' }}>
          <div className="price-now">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {!isSearch && (
            <div className="text-secondary" style={{ fontSize: '10px' }}>
              {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Stk
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSearch ? (
            <>
              <button
                className="btn-icon-small"
                onClick={(e) => { e.stopPropagation(); onToggleWishlist && onToggleWishlist(product.idProduct); }}
                style={{ background: 'transparent', color: isInWishlist ? 'var(--poke-red)' : 'var(--text-secondary)', boxShadow: 'none' }}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
              <button
                className="btn-icon"
                onClick={(e) => { e.stopPropagation(); onAdd && onAdd(product); }}
              >
                <Plus size={20} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
              <button
                className="qty-btn"
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.idProduct, -1); }}
                disabled={quantity <= 1}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
              <button
                className="qty-btn"
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.idProduct, 1); }}
              >
                <Plus size={14} />
              </button>
              <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 4px' }}></div>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(product.idProduct); }}
                style={{ background: 'transparent', color: 'var(--danger)', padding: '4px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
