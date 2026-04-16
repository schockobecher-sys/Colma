import { useState } from 'react';
import { Plus, Minus, Trash2, ChevronRight, Edit2, Check } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export default function ProductListItem({
  product,
  price,
  quantity,
  purchasePrice: initialPurchasePrice,
  onAdd,
  onRemove,
  isSearch = false
}) {
  const { updateQuantity, updateItem } = useCollection();
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState(initialPurchasePrice || 0);

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
        <div className="product-meta">{product.set} • {isSearch ? 'Deutsch' : `${product.type}`}</div>
        {!isSearch && (
          <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => updateQuantity(product.idProduct, -1)}
              style={{ background: 'var(--bg-tertiary)', color: 'white', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Minus size={12} />
            </button>
            <span style={{ fontSize: '12px', fontWeight: '700' }}>{quantity}x</span>
            <button
              onClick={() => updateQuantity(product.idProduct, 1)}
              style={{ background: 'var(--bg-tertiary)', color: 'white', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>
      <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div className="price-now">
            {(price * (quantity || 1)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          {!isSearch && (
            <div className="price-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', marginTop: '2px' }}>
              <div className="text-secondary" style={{ fontSize: '10px' }}>
                Markt: {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </div>
              <div className="purchase-price-edit" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isEditingPrice ? (
                  <>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                      onBlur={() => {
                        updateItem(product.idProduct, { purchasePrice });
                        setIsEditingPrice(false);
                      }}
                      autoFocus
                      style={{ width: '50px', background: 'var(--bg-tertiary)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', padding: '2px 4px', textAlign: 'right' }}
                    />
                    <Check size={10} className="text-success" />
                  </>
                ) : (
                  <>
                    <div className="text-secondary" style={{ fontSize: '10px' }}>
                      EK: {purchasePrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <button
                      onClick={() => setIsEditingPrice(true)}
                      style={{ background: 'transparent', color: 'var(--text-secondary)', padding: 0 }}
                    >
                      <Edit2 size={10} />
                    </button>
                  </>
                )}
              </div>
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
