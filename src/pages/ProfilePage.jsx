import { Settings, CreditCard, Bell, Shield, LogOut, RefreshCw } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export default function ProfilePage() {
  const { lastUpdate } = useCollection();

  const handleRefresh = () => {
    localStorage.removeItem('colma_last_fetch_time');
    window.location.reload();
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

        <div className="product-list">
          <div className="product-item" onClick={handleRefresh} style={{ cursor: 'pointer' }}>
            <RefreshCw size={20} className="text-secondary" />
            <div className="product-info">
              <div className="product-name">Daten aktualisieren</div>
              <div className="product-meta" style={{ fontSize: '10px' }}>Letzte Sync: {lastUpdate ? new Date(lastUpdate).toLocaleString('de-DE') : 'Nie'}</div>
            </div>
          </div>
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
          Colma Collectoppr v0.1.0 (iOS Native)<br/>
          Daten von cardmarket.com
        </div>
      </div>
    </div>
  );
}
