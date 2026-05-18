import { Settings, CreditCard, Bell, Shield, LogOut, Heart, Plus } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function ProfilePage() {
  const { wishlist, metadata, prices, toggleWishlist, addItem } = useCollection();
  const { showToast } = useToast();

  const handleAddFromWishlist = (product) => {
    const price = prices[product.idProduct]?.trend || 0;
    addItem(product.idProduct, 1, price);
    toggleWishlist(product.idProduct);
    FeedbackService.triggerAdd();
    showToast(`${product.name} zur Sammlung hinzugefügt`);
  };

  return (
    <div className="profile-page">
      <header className="app-header">
        <h1 className="app-title">Profil & Wunschliste</h1>
      </header>

      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '18px' }}>Gast-Sammler</div>
            <div className="text-secondary" style={{ fontSize: '14px' }}>Lokal gespeichert</div>
          </div>
        </div>

        <section style={{ marginBottom: '32px' }}>
          <div className="section-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={16} className="text-danger" fill="currentColor" /> Wunschliste
            </div>
          </div>
          <div className="product-list">
            {wishlist.length > 0 ? (
              wishlist.map(id => {
                const meta = metadata[id] || { idProduct: id, name: 'Lade...', set: '' };
                const price = prices[id]?.trend || 0;
                return (
                  <ProductListItem
                    key={id}
                    product={meta}
                    price={price}
                    onAdd={handleAddFromWishlist}
                    onToggleWishlist={() => toggleWishlist(id)}
                    isWishlisted={true}
                    isSearch={true}
                  />
                );
              })
            ) : (
              <div className="text-center text-secondary glass-panel" style={{ padding: '20px' }}>
                Deine Wunschliste ist leer.
              </div>
            )}
          </div>
        </section>

        <div className="section-title">Einstellungen</div>
        <div className="product-list">
          <div className="product-item">
            <Settings size={20} className="text-secondary" />
            <div className="product-info"><div className="product-name">Einstellungen</div></div>
          </div>
          <div className="product-item">
            <CreditCard size={20} className="text-secondary" />
            <div className="product-info"><div className="product-name">Abonnement (Pro)</div></div>
          </div>
          <div className="product-item">
            <Bell size={20} className="text-secondary" />
            <div className="product-info"><div className="product-name">Benachrichtigungen</div></div>
          </div>
          <div className="product-item" style={{ border: 'none', marginTop: '20px' }}>
            <LogOut size={20} className="text-danger" />
            <div className="product-info"><div className="product-name text-danger">Abmelden</div></div>
          </div>
        </div>

        <div className="text-center text-secondary" style={{ marginTop: '40px', fontSize: '12px', paddingBottom: '20px' }}>
          Colma Collectoppr v0.1.0<br/>
          Daten von cardmarket.com
        </div>
      </div>
    </div>
  );
}
