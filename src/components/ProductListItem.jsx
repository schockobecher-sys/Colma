import { useState } from 'react';
import { Plus, Minus, Trash2, ChevronRight, Edit3 } from 'lucide-react';

export default function ProductListItem({
  product,
  price,
  quantity,
  purchasePrice,
  onAdd,
  onRemove,
  onUpdateQuantity,
  onUpdatePrice,
  isSearch = false
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';

  const handlePriceEdit = (e) => {
    e.stopPropagation();
    const newPrice = prompt('Kaufpreis pro Stück ändern:', purchasePrice || price);
    if (newPrice !== null && !isNaN(parseFloat(newPrice))) {
      onUpdatePrice(product.idProduct, parseFloat(newPrice));
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
          style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
        {isCard && imageLoaded && <div className="holo-effect"></div>}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-meta">
          {product.set} • {isSearch ? 'Deutsch' : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.idProduct, -1); }}
                style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px', display: 'flex' }}
              >
                <Minus size={12} />
              </button>
              {quantity}
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.idProduct, 1); }}
                style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px', display: 'flex' }}
              >
                <Plus size={12} />
              </button>
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
            <div
              className="text-secondary"
              style={{ fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}
              onClick={handlePriceEdit}
            >
              EK: {(purchasePrice || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              <Edit3 size={8} />
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
            onClick={(e) => { e.stopPropagation(); onRemove(product.idProduct); }}
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
