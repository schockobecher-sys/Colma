import { Plus, Trash2, ChevronRight, Loader2 } from 'lucide-react';

export default function ProductListItem({
  product,
  price,
  quantity,
  onAdd,
  onRemove,
  isSearch = false
}) {
  const isPriceLoading = price === undefined || price === 0;

  return (
    <div className="product-item">
      <div className="product-image">{product.image || (product.type === 'Karte' ? '🔥' : '📦')}</div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-meta">{product.set} • {isSearch ? 'Deutsch' : `${quantity} Stück`}</div>
      </div>
      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div className="price-now">
            {isPriceLoading ? (
              <span className="text-secondary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Loader2 size={12} className="animate-spin" /> ...
              </span>
            ) : (
              (price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
            )}
          </div>
          {!isSearch && !isPriceLoading && (
            <div className="text-secondary" style={{ fontSize: '10px' }}>
              {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Stk
            </div>
          )}
        </div>

        {isSearch ? (
          <button
            className="btn-icon"
            onClick={() => onAdd && onAdd(product)}
            style={{ background: 'var(--accent)', border: 'none' }}
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
