import { TrendingUp, TrendingDown, RefreshCw, CheckCircle2, AlertCircle, Clock, Database as DbIcon, SkipForward } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';

export default function HomePage() {
  const { items, metadata, prices, getStats, lastUpdate, syncStatus, syncProgress, sync } = useCollection();

  const stats = getStats();

  if (syncStatus === 'syncing') {
    return (
      <div className="sync-overlay">
        <div className="pokeball-loader">
          <div className="pokeball-line"></div>
        </div>
        <h2 style={{ fontWeight: 900, marginBottom: '8px' }}>Synchronisiere Datenbank</h2>
        <p className="text-secondary">{syncProgress.message || 'Lade Daten von Cardmarket...'}</p>
        <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--accent)' }}>
            Dies kann beim ersten Mal bis zu 30 Sekunden dauern.
        </div>
        <div style={{ marginTop: '40px', display: 'flex', gap: '12px' }}>
            <button
                onClick={() => window.location.reload()}
                className="btn-icon"
                style={{ width: 'auto', padding: '0 20px', gap: '8px', fontSize: '14px' }}
            >
                <RefreshCw size={16} /> Neu laden
            </button>
        </div>
      </div>
    );
  }

  if (syncStatus === 'error') {
      return (
        <div className="sync-overlay">
            <AlertCircle size={64} className="text-danger" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontWeight: 900, marginBottom: '8px' }}>Verbindung fehlgeschlagen</h2>
            <p className="text-secondary" style={{ marginBottom: '30px' }}>Cardmarket Daten konnten nicht geladen werden.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => sync(true)} className="btn-icon" style={{ width: 'auto', padding: '0 20px', background: 'var(--accent)', border: 'none' }}>
                    Erneut versuchen
                </button>
                <button onClick={() => window.location.href='/collection'} className="btn-icon" style={{ width: 'auto', padding: '0 20px' }}>
                    Sammlung ansehen
                </button>
            </div>
        </div>
      );
  }

  const formattedDate = lastUpdate ? new Date(lastUpdate).toLocaleString('de-DE') : 'Unbekannt';

  return (
    <div className="dashboard fade-in">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">Colma<span>TCG</span></h1>
        <button
          onClick={() => sync(true)}
          className="btn-icon"
          title="Synchronisieren"
          style={{ width: '40px', height: '40px' }}
        >
          <RefreshCw size={18} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="portfolio-card">
        <div className="portfolio-label">Gesamtwert Portfolio</div>
        <div className="portfolio-value">
          {stats.totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </div>
        <div className={`portfolio-change ${stats.totalProfit >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {stats.totalProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          <span style={{ fontWeight: 800 }}>
            {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
          <span style={{ opacity: 0.7 }}>({stats.profitPercent.toFixed(1)}%)</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="stat-box">
          <div className="stat-label">Gesamtanzahl</div>
          <div className="stat-value">{stats.itemCount}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Unikate</div>
          <div className="stat-value">{stats.uniqueCount}</div>
        </div>
      </div>

      <section>
        <div className="section-title">
          Deine Highlights
          <Link to="/collection" className="view-all">Alle sehen</Link>
        </div>
        <div className="product-list">
          {items.slice(0, 5).map(item => {
            const meta = metadata[item.idProduct];
            const price = prices[item.idProduct]?.trend || 0;
            return (
              <div key={item.idProduct} className="product-item">
                <div className="product-image">
                  <img
                    src={`https://static.cardmarket.com/img/products/1/${item.idProduct}.jpg`}
                    alt={meta?.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/64?text=TCG'; }}
                  />
                </div>
                <div className="product-info">
                  <div className="product-name">{meta?.name || 'Lade...'}</div>
                  <div className="product-meta">{meta?.categoryName || 'Karte'} • {item.quantity}x</div>
                </div>
                <div className="product-price">
                  <div className="price-now">{(price * item.quantity).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="stat-box text-center" style={{ padding: '40px 20px' }}>
              <DbIcon size={40} className="text-secondary" style={{ marginBottom: '12px', opacity: 0.5 }} />
              <div className="text-secondary">Deine Sammlung ist noch leer.</div>
              <Link to="/cards" className="text-accent" style={{ textDecoration: 'none', fontWeight: 700, marginTop: '12px', display: 'block' }}>Jetzt Karten suchen</Link>
            </div>
          )}
        </div>
      </section>

      <footer style={{ marginTop: '40px', padding: '20px', textAlign: 'center', opacity: 0.5, fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Clock size={12} /> Letztes Preis-Update: {formattedDate}
        </div>
        <div style={{ marginTop: '4px' }}>Daten von Cardmarket.com</div>
      </footer>
    </div>
  );
}
