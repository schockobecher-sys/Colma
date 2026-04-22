import { Plus, Minus, Trash2, ChevronRight, Check } from 'lucide-react';
import { useState } from 'react';
import { useCollection } from '../context/CollectionContext';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  isSearch = false
}) {
  const { updateQuantity } = useCollection();
  const [isAdded, setIsAdded] = useState(false);
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';

  const handleAddClick = () => {
    if (onAdd) {
      onAdd(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleUpdateQuantity = (e, delta) => {
    e.stopPropagation();
    updateQuantity(product.idProduct, delta);
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
        <div className="product-meta">
          {product.set}
          {!isSearch && ` • ${quantity} Stk`}
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
          <button
            className={`btn-icon ${isAdded ? 'btn-success' : ''}`}
            onClick={handleAddClick}
            disabled={isAdded}
            aria-label="Zum Portfolio hinzufügen"
          >
            {isAdded ? <Check size={20} /> : <Plus size={20} />}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <button
              className="qty-btn"
              onClick={(e) => handleUpdateQuantity(e, -1)}
              aria-label="Menge verringern"
            >
              <Minus size={14} />
            </button>
            <button
              className="qty-btn"
              onClick={(e) => handleUpdateQuantity(e, 1)}
              aria-label="Menge erhöhen"
            >
              <Plus size={14} />
            </button>
            {onRemove && (
              <button
                className="btn-icon-simple"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(product.idProduct);
                }}
                style={{ color: 'var(--danger)' }}
                aria-label="Entfernen"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
