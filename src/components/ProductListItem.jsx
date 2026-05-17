import { Plus, Trash2, ChevronRight, Minus } from 'lucide-react';

export default function ProductListItem({
  product,
  price,
  quantity,
  purchasePrice,
  onAdd,
  onRemove,
  onUpdateQuantity,
  isSearch = false
}) {
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';
  const totalValue = price * (quantity || 1);
  const profit = quantity ? (price - (purchasePrice || 0)) * quantity : 0;

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
          {!isSearch && (
            <div style={{ marginTop: '2px', display: 'flex', gap: '8px' }}>
              <span>EK: {(purchasePrice || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              <span className={profit >= 0 ? 'text-success' : 'text-danger'}>
                {profit >= 0 ? '+' : ''}{profit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div className="price-now">
            {totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {!isSearch && (
            <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(-1); }}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <Minus size={12} />
              </button>
              <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '12px', textAlign: 'center' }}>{quantity}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(1); }}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <Plus size={12} />
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
