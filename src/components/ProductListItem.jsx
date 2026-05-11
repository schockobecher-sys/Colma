import { Plus, Trash2, ChevronRight, Heart } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  onToggleWishlist,
  isSearch = false
}) {
  const { wishlist } = useCollection();
  const isInWishlist = wishlist.includes(product.idProduct);
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
      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onToggleWishlist && (
          <button
            className={`btn-wishlist ${isInWishlist ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.idProduct);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: isInWishlist ? 'var(--danger)' : 'var(--text-secondary)',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Heart size={20} fill={isInWishlist ? 'var(--danger)' : 'transparent'} />
          </button>
        )}

        <div style={{ textAlign: 'right', minWidth: '70px' }}>
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
