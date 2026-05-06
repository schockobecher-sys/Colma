import { Plus, Trash2, ChevronRight, Minus, Edit3 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();
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
            onClick={() => {
              onAdd && onAdd(product);
              showToast(`${product.name} hinzugefügt`);
            }}
          >
            <Plus size={20} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', borderRadius: '10px', padding: '2px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity && onUpdateQuantity(product.idProduct, -1);
                }}
                style={{ background: 'transparent', color: 'white', padding: '4px' }}
              >
                <Minus size={14} />
              </button>
              <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}>{quantity}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity && onUpdateQuantity(product.idProduct, 1);
                }}
                style={{ background: 'transparent', color: 'white', padding: '4px' }}
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const newPrice = prompt('Einkaufspreis pro Stück (€):', purchasePrice || price);
                if (newPrice !== null) {
                  const parsed = parseFloat(newPrice.replace(',', '.'));
                  if (!isNaN(parsed)) {
                    onUpdatePurchasePrice && onUpdatePurchasePrice(product.idProduct, parsed);
                    showToast('Preis aktualisiert');
                  }
                }
              }}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '6px', color: 'var(--text-secondary)' }}
            >
              <Edit3 size={14} />
            </button>

            {onRemove && (
              <button
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(product.idProduct);
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', width: 'auto', boxShadow: 'none', padding: '4px' }}
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
