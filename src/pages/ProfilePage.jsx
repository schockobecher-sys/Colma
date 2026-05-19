import { Settings, LogOut, Heart, Trash2, PlusCircle, Sparkles } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { useMemo } from 'react';
import FeedbackService from '../services/FeedbackService';

export default function ProfilePage() {
  const { wishlist, toggleWishlist, addItem, metadata, prices } = useCollection();
  const { showToast } = useToast();

  const wishlistItems = useMemo(() => {
    return wishlist.map(id => metadata[id]).filter(Boolean);
  }, [wishlist, metadata]);

  const handleAddFromWishlist = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product, 1, price);
    toggleWishlist(product.idProduct); // Remove from wishlist after adding
    FeedbackService.triggerAdd();
    showToast(`${product.name} zur Sammlung hinzugefügt`);
  };

  const handleRemoveFromWishlist = (id) => {
    toggleWishlist(id);
    showToast('Von der Wunschliste entfernt', 'info');
  };

  return (
    <div className="profile-page">
      <header className="app-header">
        <h1 className="app-title">Wunschliste</h1>
      </header>

      <div style={{ padding: '0 16px' }}>
        <section style={{ marginBottom: '32px' }}>
          <div className="section-title">
            <span><Heart size={14} className="text-danger" style={{ marginRight: '6px' }} /> Gespeicherte Produkte</span>
            <span style={{ fontSize: '10px' }}>{wishlist.length} Items</span>
          </div>

          <div className="product-list">
            {wishlistItems.length > 0 ? (
              wishlistItems.map(item => (
                <div key={item.idProduct} className="product-item glass-panel">
                  <div className="product-image">
                    <img src={`https://static.cardmarket.com/img/products/1/${item.idProduct}.jpg`} alt="" />
                  </div>
                  <div className="product-info">
                    <div className="product-name">{item.name}</div>
                    <div className="product-meta">{item.set}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-icon"
                      onClick={() => handleAddFromWishlist(item)}
                      style={{ background: 'var(--success)', boxShadow: '0 4px 15px rgba(74, 222, 128, 0.2)' }}
                    >
                      <PlusCircle size={20} color="white" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.idProduct)}
                      style={{ background: 'transparent', color: 'var(--text-secondary)' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state text-center glass-panel" style={{ padding: '40px 20px' }}>
                <Heart size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <p className="text-secondary" style={{ fontSize: '14px' }}>Deine Wunschliste ist noch leer.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="section-title">Account & Einstellungen</div>
          <div className="glass-panel" style={{ padding: '8px' }}>
            <div className="product-item" style={{ border: 'none' }}>
              <Settings size={20} className="text-secondary" />
              <div className="product-info"><div className="product-name">Einstellungen</div></div>
            </div>
            <div className="product-item" style={{ border: 'none' }}>
              <Sparkles size={20} className="text-accent" />
              <div className="product-info"><div className="product-name">Colma Pro aktivieren</div></div>
            </div>
            <div className="product-item" style={{ border: 'none' }}>
              <LogOut size={20} className="text-danger" />
              <div className="product-info"><div className="product-name text-danger">Daten löschen</div></div>
            </div>
          </div>
        </section>

        <div className="text-center text-secondary" style={{ marginTop: '40px', fontSize: '12px', paddingBottom: '20px' }}>
          Colma Redesign v1.0.0<br/>
          Entwickelt für Pokémon-Sammler
        </div>
      </div>
    </div>
  );
}
