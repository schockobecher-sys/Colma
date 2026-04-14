import { Plus, Trash2, ChevronRight, TrendingUp } from 'lucide-react';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  isSearch = false
}) {
  const imageUrl = `https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`;

  return (
    <div className="product-item fade-in">
      <div className="product-image">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/64?text=TCG'; }}
        />
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-meta">
            {product.categoryName || product.set || 'Produkt'}
            {!isSearch && ` • ${quantity} Stk`}
        </div>
      </div>
      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div className="price-now">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {price > 0 && (
            <div className="text-success" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', fontWeight: 700 }}>
              <TrendingUp size={10} /> Market
            </div>
          )}
        </div>

        {isSearch ? (
          <button
            className="btn-icon"
            onClick={(e) => {
                e.preventDefault();
                onAdd && onAdd(product);
            }}
            style={{ background: 'var(--pk-red)', border: 'none' }}
          >
            <Plus size={20} color="white" />
          </button>
        ) : onRemove ? (
          <button
            className="btn-icon"
            onClick={() => onRemove(product.idProduct)}
            style={{ background: 'transparent', border: 'none', color: 'var(--danger)', width: 'auto' }}
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
