import { Settings, LogOut, Heart, Plus } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import ProductListItem from '../components/ProductListItem';
import FeedbackService from '../services/FeedbackService';

export default function ProfilePage() {
  const { wishlist, metadata, prices, toggleWishlist, addItem } = useCollection();
  const { showToast } = useToast();

  const handleAddFromWishlist = (idProduct) => {
    const meta = metadata[idProduct];
    const price = prices[idProduct]?.trend || 0;
    addItem(idProduct, 1, price);
    toggleWishlist(idProduct); // Remove from wishlist after adding
    FeedbackService.triggerAdd();
    showToast(`${meta?.name || 'Produkt'} zur Sammlung hinzugefügt`, 'success');
  };

  return (
    <div className="profile-page">
      <header className="app-header">
        <h1 className="app-title">Profil & Wunschliste</h1>
      </header>

      <div style={{ padding: '0 16px' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', padding: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 0 20px rgba(255, 203, 5, 0.4)' }}>👤</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '20px' }}>Gast-Sammler</div>
            <div className="text-secondary" style={{ fontSize: '13px', fontWeight: '600' }}>Offline Modus • Lokal gespeichert</div>
          </div>
        </div>

        <section style={{ marginBottom: '32px' }}>
          <div className="section-title">
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={16} className="text-danger" fill="var(--danger)" /> Wunschliste
            </div>
            <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>{wishlist.length}</span>
          </div>

          <div className="product-list">
            {wishlist.length > 0 ? (
              wishlist.map(id => {
                const meta = metadata[id] || { idProduct: id, name: 'Lade...', set: '', type: 'Karte' };
                const price = prices[id]?.trend || 0;
                return (
                  <ProductListItem
                    key={id}
                    product={meta}
                    price={price}
                    isSearch={true}
                    onAdd={() => handleAddFromWishlist(id)}
                    onToggleWishlist={toggleWishlist}
                  />
                );
              })
            ) : (
              <div className="glass-panel text-center text-secondary" style={{ padding: '30px' }}>
                Deine Wunschliste ist noch leer.
              </div>
            )}
          </div>
        </section>

        <div className="section-title">Einstellungen</div>
        <div className="product-list">
          <div className="product-item">
            <Settings size={20} className="text-secondary" />
            <div className="product-info"><div className="product-name">App Einstellungen</div></div>
          </div>
          <div className="product-item" style={{ marginTop: '10px' }}>
            <LogOut size={20} className="text-danger" />
            <div className="product-info"><div className="product-name text-danger">Daten löschen</div></div>
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
