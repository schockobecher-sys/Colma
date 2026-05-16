import { Settings, CreditCard, Bell, Shield, LogOut, Heart, PlusCircle } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function ProfilePage() {
  const { wishlist, metadata, prices, toggleWishlist, addItem } = useCollection();
  const { showToast } = useToast();

  const handleAddFromWishlist = (idProduct) => {
    const price = prices[idProduct]?.trend || 0;
    addItem(idProduct, 1, price);
    toggleWishlist(idProduct); // Remove from wishlist when added
    FeedbackService.triggerAdd();
    showToast('Zur Sammlung hinzugefügt', 'success');
  };

  return (
    <div className="profile-page">
      <header className="app-header">
        <h1 className="app-title">Profil & Wunschliste</h1>
      </header>

      <div style={{ padding: '0 16px' }}>
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
                  <div key={id} className="product-item">
                    <div className="product-image">
                      <img src={`https://static.cardmarket.com/img/products/1/${id}.jpg`} alt="" />
                    </div>
                    <div className="product-info">
                      <div className="product-name">{meta.name}</div>
                      <div className="product-meta">{meta.set}</div>
                    </div>
                    <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="price-now">{price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                      <button
                        className="btn-icon"
                        onClick={() => handleAddFromWishlist(id)}
                        title="In Sammlung übernehmen"
                      >
                        <PlusCircle size={20} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ background: 'transparent', boxShadow: 'none', color: 'var(--text-secondary)' }}
                        onClick={() => toggleWishlist(id)}
                      >
                        <Heart size={20} className="text-danger" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-panel text-center text-secondary" style={{ padding: '24px' }}>
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
          <div className="product-item">
            <Shield size={20} className="text-secondary" />
            <div className="product-info"><div className="product-name">Datenschutz</div></div>
          </div>
          <div className="product-item" style={{ border: 'none', marginTop: '20px' }}>
            <LogOut size={20} className="text-danger" />
            <div className="product-info"><div className="product-name text-danger">Abmelden</div></div>
          </div>
        </div>

        <div className="text-center text-secondary" style={{ marginTop: '40px', fontSize: '12px', paddingBottom: '20px' }}>
          Colma v1.0.0<br/>
          Daten von cardmarket.com
        </div>
      </div>
    </div>
  );
}
