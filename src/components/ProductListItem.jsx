import { Plus, Trash2, ChevronRight, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  isSearch = false,
  purchasePrice
}) {
  const { updateQuantity } = useCollection();
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';

  const gain = purchasePrice ? price - purchasePrice : 0;
  const gainPercent = purchasePrice > 0 ? (gain / purchasePrice) * 100 : 0;

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
          {product.set} • {isSearch ? 'Deutsch' : `${quantity} Stück`}
        </div>
        {!isSearch && purchasePrice > 0 && (
          <div className={`product-gain ${gain >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
            {gain >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {gain >= 0 ? '+' : ''}{gain.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} ({Math.abs(gainPercent).toFixed(1)}%)
          </div>
        )}
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
            onClick={() => onAdd && onAdd(product)}
            aria-label="Hinzufügen"
          >
            <Plus size={20} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div className="qty-controls" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
              <button
                onClick={(e) => handleUpdateQuantity(e, -1)}
                style={{ background: 'transparent', padding: '4px', color: 'white', opacity: quantity <= 1 ? 0.3 : 1 }}
                disabled={quantity <= 1}
              >
                <Minus size={14} />
              </button>
              <button
                onClick={(e) => handleUpdateQuantity(e, 1)}
                style={{ background: 'transparent', padding: '4px', color: 'white' }}
              >
                <Plus size={14} />
              </button>
            </div>
            {onRemove && (
              <button
                className="btn-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(product.idProduct);
                }}
                style={{ background: 'rgba(248, 113, 113, 0.1)', border: 'none', color: 'var(--danger)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Löschen"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
