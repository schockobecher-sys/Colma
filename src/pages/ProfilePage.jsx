import { Settings, CreditCard, Bell, Shield, LogOut, Heart, Plus } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import FeedbackService from '../services/FeedbackService';

export default function ProfilePage() {
  const { wishlist, metadata, prices, addItem, toggleWishlist } = useCollection();
  const { showToast } = useToast();

  const handleAdd = (idProduct) => {
    const price = prices[idProduct]?.trend || 0;
    addItem(idProduct, 1, price);
    toggleWishlist(idProduct); // Remove from wishlist after adding
    FeedbackService.triggerAdd();
    showToast('Zur Sammlung hinzugefügt');
  };

  return (
    <div className="profile-page">
      <header className="app-header">
        <h1 className="app-title">Profil</h1>
      </header>

      <div style={{ padding: '0 16px' }}>
        <section style={{ marginBottom: '32px' }}>
          <div className="section-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={16} className="text-danger" fill="var(--danger)" /> Wunschliste
            </div>
          </div>
          <div className="product-list">
            {wishlist.length > 0 ? (
              wishlist.map(idProduct => {
                const meta = metadata[idProduct] || { name: 'Lade...', set: '' };
                const price = prices[idProduct]?.trend || 0;
                return (
                  <div key={idProduct} className="product-item">
                    <div className="product-image">
                       <img src={`https://static.cardmarket.com/img/products/1/${idProduct}.jpg`} alt="" />
                    </div>
                    <div className="product-info">
                      <div className="product-name">{meta.name}</div>
                      <div className="product-meta">{meta.set} • {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                    </div>
                    <button
                      className="btn-icon"
                      onClick={() => handleAdd(idProduct)}
                      style={{ width: '36px', height: '36px', borderRadius: '10px' }}
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      onClick={() => toggleWishlist(idProduct)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px' }}
                    >
                      <Heart size={18} fill="var(--danger)" color="var(--danger)" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-secondary glass-panel" style={{ padding: '20px' }}>
                Deine Wunschliste ist leer.
              </div>
            )}
          </div>
        </section>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '18px' }}>Gast-Sammler</div>
            <div className="text-secondary" style={{ fontSize: '14px' }}>Lokal gespeichert</div>
          </div>
        </div>

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

        <div className="text-center text-secondary" style={{ marginTop: '40px', fontSize: '12px' }}>
          Colma Collectoppr v0.1.0<br/>
          Daten von cardmarket.com
        </div>
      </div>
    </div>
  );
}
