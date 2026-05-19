import { Plus, Trash2, Heart, Edit2, Minus } from 'lucide-react';
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
  isSearch = false
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { updateItem } = useCollection();

  const idProduct = product.idProduct;
  const imageUrl = `https://static.cardmarket.com/img/products/1/${idProduct}.jpg`;
  const isCard = product.type === 'Karte';
  const isInWishlist = wishlist.includes(idProduct);

  const handleEditPrice = () => {
    const newPrice = prompt('Neuer Einkaufspreis (€):', purchasePrice || price);
    if (newPrice !== null && !isNaN(parseFloat(newPrice))) {
      updateItem(idProduct, { purchasePrice: parseFloat(newPrice) });
    }
  };

  return (
    <div className="product-item glass-panel">
      <div className={`product-image ${!imageLoaded ? 'skeleton' : ''}`}>
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = isCard ? '<span style="font-size: 24px">🔥</span>' : '<span style="font-size: 24px">📦</span>';
            setImageLoaded(true);
          }}
          style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
        {isCard && <div className="holo-effect"></div>}
      </div>

      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-meta">
          {product.set} • {isSearch ? 'Deutsch' : `${quantity} Stk.`}
        </div>
        {!isSearch && purchasePrice !== undefined && (
          <div className="product-meta" style={{ fontSize: '10px', marginTop: '4px' }}>
            EK: {purchasePrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
        )}
      </div>

      <div className="product-actions">
        <div className="price-container" style={{ textAlign: 'right', marginBottom: isSearch ? 0 : '4px' }}>
          <div className="price-now">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className={`price-trend ${price >= (purchasePrice || price) ? 'text-success' : 'text-danger'}`} style={{ fontSize: '10px' }}>
            {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Stk
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isSearch ? (
            <>
              <button
                className={`btn-wishlist ${isInWishlist ? 'active' : ''}`}
                onClick={() => onToggleWishlist && onToggleWishlist(idProduct)}
                style={{ background: 'transparent', color: isInWishlist ? 'var(--poke-red)' : 'var(--text-secondary)' }}
              >
                <Heart size={20} fill={isInWishlist ? 'var(--poke-red)' : 'none'} />
              </button>
              <button className="btn-icon" onClick={() => onAdd && onAdd(product)}>
                <Plus size={20} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
                <button onClick={() => onUpdateQuantity(idProduct, -1)} style={{ background: 'transparent', color: 'white', padding: '4px', display: 'flex', justifyContent: 'center' }}><Minus size={14} /></button>
                <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => onUpdateQuantity(idProduct, 1)} style={{ background: 'transparent', color: 'white', padding: '4px', display: 'flex', justifyContent: 'center' }}><Plus size={14} /></button>
              </div>
              <button onClick={handleEditPrice} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => onRemove(idProduct)} style={{ background: 'transparent', color: 'var(--danger)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
