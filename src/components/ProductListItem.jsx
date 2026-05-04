import { Plus, Minus, Trash2, ChevronRight, Edit3 } from 'lucide-react';
import { useState } from 'react';

export default function ProductListItem({
  product,
  price,
  quantity,
  purchasePrice,
  onAdd,
  onRemove,
  onUpdateQuantity,
  onUpdatePurchasePrice,
  isSearch = false
}) {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editPrice, setEditPrice] = useState(purchasePrice || 0);

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
      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div className="price-now">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {!isSearch && (
            <div
              className="text-secondary"
              style={{ fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', cursor: 'pointer' }}
              onClick={() => setIsEditingPrice(true)}
            >
              {isEditingPrice ? (
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  onBlur={() => {
                    setIsEditingPrice(false);
                    onUpdatePurchasePrice && onUpdatePurchasePrice(product.idProduct, editPrice);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingPrice(false);
                      onUpdatePurchasePrice && onUpdatePurchasePrice(product.idProduct, editPrice);
                    }
                  }}
                  style={{ width: '50px', background: 'var(--bg-tertiary)', border: '1px solid var(--accent)', color: 'white', fontSize: '10px', padding: '2px', borderRadius: '4px' }}
                />
              ) : (
                <>EK: {Number(purchasePrice || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} <Edit3 size={8} /></>
              )}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' }}>
              <button
                onClick={() => onUpdateQuantity && onUpdateQuantity(product.idProduct, -1)}
                style={{ background: 'transparent', padding: '4px', color: 'white' }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontSize: '12px', fontWeight: '800', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
              <button
                onClick={() => onUpdateQuantity && onUpdateQuantity(product.idProduct, 1)}
                style={{ background: 'transparent', padding: '4px', color: 'white' }}
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => onRemove && onRemove(product.idProduct)}
              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', padding: '4px' }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
