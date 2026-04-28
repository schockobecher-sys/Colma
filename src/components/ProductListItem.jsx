import { Plus, Minus, Trash2, ChevronRight } from 'lucide-react';

export default function ProductListItem({
  product,
  price,
  quantity,
  purchasePrice,
  onAdd,
  onRemove,
  onUpdateQuantity,
  onUpdatePurchasePrice,
  isSearch = false,
  isLoading = false
}) {
  if (isLoading) {
    return (
      <div className="product-item skeleton-loading">
        <div className="product-image skeleton"></div>
        <div className="product-info">
          <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ width: '40%', height: '12px' }}></div>
        </div>
        <div className="product-actions">
          <div className="skeleton" style={{ width: '40px', height: '16px' }}></div>
        </div>
      </div>
    );
  }

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
      {isSearch ? (
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-meta">{product.set} • Deutsch</div>
        </div>
      ) : (
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-meta">
            <div style={{ marginBottom: '4px' }}>{product.set}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity && onUpdateQuantity(product.idProduct, -1); }}
                  style={{ background: 'transparent', color: 'inherit', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  <Minus size={10} />
                </button>
                <span style={{ fontSize: '11px', fontWeight: '700', minWidth: '12px', textAlign: 'center' }}>{quantity}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity && onUpdateQuantity(product.idProduct, 1); }}
                  style={{ background: 'transparent', color: 'inherit', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  <Plus size={10} />
                </button>
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>EK:</span>
              <input
                type="number"
                step="0.01"
                defaultValue={purchasePrice}
                onBlur={(e) => onUpdatePurchasePrice && onUpdatePurchasePrice(product.idProduct, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: 'none',
                  color: 'white',
                  fontSize: '11px',
                  width: '50px',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>€</span>
            </div>
          </div>
        </div>
      )}
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
