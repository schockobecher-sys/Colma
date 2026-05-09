import { Plus, Minus, Trash2, ChevronRight, Heart, Edit3 } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import FeedbackService from '../services/FeedbackService';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  isSearch = false
}) {
  const { updateQuantity, updatePurchasePrice, toggleWishlist, isInWishlist } = useCollection();
  const { showToast } = useToast();

  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';
  const wishlisted = isInWishlist(product.idProduct);

  const handleUpdateQuantity = (e, delta) => {
    e.stopPropagation();
    updateQuantity(product.idProduct, delta);
    FeedbackService.vibrate(10);
  };

  const handleEditPrice = (e) => {
    e.stopPropagation();
    const currentPrice = price.toString();
    const newPrice = prompt(`Kaufpreis für ${product.name} aktualisieren:`, currentPrice);
    if (newPrice !== null && !isNaN(newPrice)) {
      updatePurchasePrice(product.idProduct, newPrice);
      showToast('Preis aktualisiert');
      FeedbackService.vibrate(20);
    }
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product.idProduct);
    showToast(wishlisted ? 'Von Wunschliste entfernt' : 'Zur Wunschliste hinzugefügt');
    FeedbackService.vibrate(15);
  };

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
        <div className="product-meta">{product.set} {isSearch ? '• Deutsch' : ''}</div>

        {!isSearch && (
          <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <button className="qty-btn" onClick={(e) => handleUpdateQuantity(e, -1)}><Minus size={14} /></button>
            <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{quantity}x</span>
            <button className="qty-btn" onClick={(e) => handleUpdateQuantity(e, 1)}><Plus size={14} /></button>
          </div>
        )}
      </div>

      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div className="price-now">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {!isSearch && (
            <div className="text-secondary" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
               {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Stk
               <Edit3 size={10} className="clickable" onClick={handleEditPrice} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className={`btn-wishlist ${wishlisted ? 'active' : ''}`}
            onClick={handleToggleWishlist}
            style={{ background: 'transparent', border: 'none', color: wishlisted ? 'var(--poke-red)' : 'var(--text-secondary)', padding: 0 }}
          >
            <Heart size={18} fill={wishlisted ? 'var(--poke-red)' : 'transparent'} />
          </button>

          {isSearch ? (
            <button
              className="btn-icon-small"
              onClick={() => onAdd && onAdd(product)}
            >
              <Plus size={18} />
            </button>
          ) : onRemove ? (
            <button
              className="btn-remove"
              onClick={() => onRemove(product.idProduct)}
              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', padding: 0 }}
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <ChevronRight size={16} className="text-secondary" />
          )}
        </div>
      </div>
    </div>
  );
}
