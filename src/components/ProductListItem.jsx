import { Plus, Minus, Trash2, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useCollection } from '../context/CollectionContext';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  isSearch = false
}) {
  const { showToast } = useToast();
  const { updateQuantity } = useCollection();

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAdd) {
      onAdd(product);
      showToast(`${product.name} zur Sammlung hinzugefügt`, 'success');
    }
  };

  const handleQtyChange = (e, delta) => {
    e.stopPropagation();
    updateQuantity(product.idProduct, delta);
    if (delta > 0) {
      showToast(`Menge von ${product.name} erhöht`, 'success');
    } else {
      showToast(`Menge von ${product.name} verringert`, 'info');
    }
  };
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
            <div className="text-secondary" style={{ fontSize: '10px' }}>
              {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Stk
            </div>
          )}
        </div>

        {isSearch ? (
          <button
            className="btn-icon"
            onClick={handleAddClick}
          >
            <Plus size={20} />
          </button>
        ) : quantity !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <button
              className="btn-icon"
              onClick={(e) => handleQtyChange(e, -1)}
              style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', boxShadow: 'none' }}
            >
              <Minus size={14} />
            </button>
            <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '800' }}>{quantity}</span>
            <button
              className="btn-icon"
              onClick={(e) => handleQtyChange(e, 1)}
              style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', boxShadow: 'none' }}
            >
              <Plus size={14} />
            </button>
          </div>
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
