import { Settings, CreditCard, Bell, Shield, LogOut, Heart, Trash2, Plus } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import FeedbackService from '../services/FeedbackService';

export default function ProfilePage() {
  const { wishlist, metadata, prices, toggleWishlist, addItem } = useCollection();
  const { addToast } = useToast();

  const handleRemoveFromWishlist = (idProduct) => {
    toggleWishlist(idProduct);
    FeedbackService.triggerRemove();
    addToast('Von Wunschliste entfernt', 'info');
  };

  const handleAddToCollection = (idProduct) => {
    const meta = metadata[idProduct];
    const price = prices[idProduct]?.trend || 0;
    addItem(idProduct, 1, price);
    toggleWishlist(idProduct);
    FeedbackService.triggerAdd();
    addToast(`${meta?.name || 'Produkt'} zur Sammlung hinzugefügt`);
  };

  return (
    <div className="profile-page">
      <header className="app-header">
        <h1 className="app-title">Profil</h1>
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
              <Heart size={16} className="text-danger" /> Wunschliste
            </div>
            <span className="text-secondary" style={{ fontSize: '12px' }}>{wishlist.length}</span>
          </div>

          <div className="product-list">
            {wishlist.length > 0 ? (
              wishlist.map(id => {
                const meta = metadata[id] || { name: 'Lade...', set: '', idProduct: id };
                const price = prices[id]?.trend || 0;
                return (
                  <div key={id} className="product-item">
                    <div className="product-image">
                       <img src={`https://static.cardmarket.com/img/products/1/${id}.jpg`} alt="" />
                    </div>
                    <div className="product-info">
                      <div className="product-name">{meta.name}</div>
                      <div className="product-meta">{meta.set} • {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="qty-btn"
                          onClick={() => handleAddToCollection(id)}
                          style={{ background: 'var(--accent)', color: '#000' }}
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          className="qty-btn"
                          onClick={() => handleRemoveFromWishlist(id)}
                          style={{ background: 'rgba(255,0,0,0.1)', color: 'var(--danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-secondary glass-panel" style={{ padding: '24px' }}>
                Deine Wunschliste ist leer.
              </div>
            )}
          </div>
        </section>

        <section>
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
        </section>

        <div className="text-center text-secondary" style={{ marginTop: '40px', paddingBottom: '20px', fontSize: '12px' }}>
          Colma Collectoppr v0.2.0<br/>
          Daten von cardmarket.com
        </div>
      </div>
    </div>
  );
}
