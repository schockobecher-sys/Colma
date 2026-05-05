import { Plus, Minus, Trash2, ChevronRight, Edit3 } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  onUpdateQuantity,
  isSearch = false
}) {
  const { updatePurchasePrice, items } = useCollection();
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';

  const handleEditPrice = (e) => {
    e.stopPropagation();
    const item = items.find(i => i.idProduct === product.idProduct);
    const newPrice = prompt('Neuer Einkaufspreis (€):', item?.purchasePrice || 0);
    if (newPrice !== null && !isNaN(newPrice)) {
      updatePurchasePrice(product.idProduct, parseFloat(newPrice));
    }
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
        <div className="product-meta">{product.set} • {isSearch ? 'Deutsch' : `${product.type}`}</div>
      </div>

      {!isSearch && onUpdateQuantity && (
        <div className="quantity-controls">
          <button
            className="qty-btn"
            onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.idProduct, -1); }}
          >
            <Minus size={14} />
          </button>
          <span className="qty-value">{quantity}</span>
          <button
            className="qty-btn"
            onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.idProduct, 1); }}
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div className="price-now">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {!isSearch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
               <div className="text-secondary" style={{ fontSize: '10px' }}>
                {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Stk
              </div>
              <button className="price-edit-btn" onClick={handleEditPrice} title="Einkaufspreis bearbeiten">
                <Edit3 size={10} />
              </button>
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
