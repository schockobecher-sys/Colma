import { TrendingUp, Plus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  isSearch = false
}) {
  const navigate = useNavigate();
  // Improved heuristic for Cardmarket Images
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;

  const handleInfo = (e) => {
      e.stopPropagation();
      navigate(`/product/${product.idProduct}`);
  };

  return (
    <div
        className="item-card cyber-card fade-in"
        onClick={() => navigate(`/product/${product.idProduct}`)}
        style={{ cursor: 'pointer' }}
    >
      <div className="item-img-container holo-effect">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/150x210/10141e/ffffff?text=?';
          }}
        />
      </div>

      <div className="item-details">
        <div className="item-name">{product.name}</div>
        <div className="item-sub">
            {product.categoryName} {product.idExpansion ? `• Exp ${product.idExpansion}` : ''}
            {!isSearch && ` • ${quantity} Stück`}
        </div>
      </div>

      <div className="item-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ textAlign: 'right' }}>
          <div className="item-price">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {price > 0 && (
            <div className="text-accent" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', fontWeight: 800 }}>
              <TrendingUp size={10} /> TREND
            </div>
          )}
        </div>

        {isSearch ? (
          <button
            className="btn-icon"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAdd && onAdd(product);
            }}
            style={{
                background: 'var(--pk-red)',
                border: 'none',
                borderRadius: '12px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
          >
            <Plus size={20} color="white" />
          </button>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>
              <Info size={18} onClick={handleInfo} />
          </div>
        )}
      </div>
    </div>
  );
}
