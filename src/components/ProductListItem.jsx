import { Plus, Trash2, ChevronRight, Heart, Minus, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { useCollection } from '../context/CollectionContext';
import FeedbackService from '../services/FeedbackService';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  onUpdateQuantity,
  isSearch = false
}) {
  const { wishlist, toggleWishlist, updateItem } = useCollection();
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';
  const isInWishlist = wishlist.includes(product.idProduct);

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product.idProduct);
    FeedbackService.vibrate(10);
  };

  const handleEditPrice = (e) => {
    e.stopPropagation();
    const currentPrice = product.purchasePrice || price || '';
    const newPrice = prompt('Einkaufspreis bearbeiten (€):', currentPrice);
    if (newPrice !== null && !isNaN(parseFloat(newPrice))) {
      updateItem(product.idProduct, { purchasePrice: parseFloat(newPrice) });
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
          style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
        />
        {isCard && imageLoaded && <div className="holo-effect"></div>}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {product.set}
          {isSearch && (
             <button
              onClick={handleToggleWishlist}
              style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex' }}
             >
              <Heart size={12} fill={isInWishlist ? 'var(--danger)' : 'none'} color={isInWishlist ? 'var(--danger)' : 'var(--text-secondary)'} />
             </button>
          )}
        </div>
      </div>
      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isSearch && (
          <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '2px' }}>
            <button onClick={() => onUpdateQuantity(product.idProduct, -1)} style={{ background: 'transparent', color: 'white', padding: '4px' }}><Minus size={14} /></button>
            <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{quantity}</span>
            <button onClick={() => onUpdateQuantity(product.idProduct, 1)} style={{ background: 'transparent', color: 'white', padding: '4px' }}><Plus size={14} /></button>
          </div>
        )}

        <div style={{ textAlign: 'right', minWidth: '70px' }}>
          <div className="price-now">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {!isSearch && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
              <span className="text-secondary" style={{ fontSize: '10px' }}>EK: {product.purchasePrice?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '---'}</span>
              <button onClick={handleEditPrice} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: 0 }}><Edit3 size={10} /></button>
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
          <button
            onClick={() => onRemove(product.idProduct)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px' }}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
