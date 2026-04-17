import { useState } from 'react';
import { Plus, Trash2, ChevronRight, Minus, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { prices } = useCollection();
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;
  const isCard = product.type === 'Karte';

  const priceDetails = prices[product.idProduct] || {};

  return (
    <div className={`product-item-container ${isExpanded ? 'expanded' : ''} ${isSearch ? 'is-search' : ''}`}>
      <div
        className="product-item"
        onClick={() => !isSearch && setIsExpanded(!isExpanded)}
      >
        <div className="product-image">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              if (e.target.parentNode) {
                e.target.parentNode.innerHTML = isCard ? '🔥' : '📦';
              }
            }}
          />
          {isCard && <div className="holo-effect"></div>}
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-meta">{product.set} • {isSearch ? 'Deutsch' : `${quantity} Stück`}</div>

          {!isSearch && onUpdateQuantity && (
            <div className="quantity-controls">
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(-1); }}
                className="qty-btn"
              >
                <Minus size={14} />
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(1); }}
                className="qty-btn"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="product-actions">
          <div className="price-info">
            <div className="price-now">
              {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
            {!isSearch && (
              <div className="price-unit">
                {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Stk
              </div>
            )}
          </div>

          {isSearch ? (
            <button
              className="btn-icon"
              onClick={(e) => { e.stopPropagation(); onAdd && onAdd(product); }}
            >
              <Plus size={20} />
            </button>
          ) : (
            <div className="expand-indicator">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          )}
        </div>
      </div>

      {isExpanded && !isSearch && (
        <div className="product-details">
          <div className="price-details-grid">
            <div className="price-detail-item">
              <div className="price-detail-label">Low</div>
              <div className="price-detail-value">{priceDetails.low?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '---'}</div>
            </div>
            <div className="price-detail-item">
              <div className="price-detail-label">Avg</div>
              <div className="price-detail-value">{priceDetails.avg?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '---'}</div>
            </div>
            <div className="price-detail-item">
              <div className="price-detail-label">Trend</div>
              <div className="price-detail-value trend">{priceDetails.trend?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '---'}</div>
            </div>
          </div>

          <div className="details-actions">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove && onRemove(product.idProduct); }}
              className="btn-remove"
            >
              <Trash2 size={14} /> Entfernen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
