import { TrendingUp, TrendingDown, Plus, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, Clock, Trophy, Sparkles, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { useMemo } from 'react';

export default function HomePage() {
  const { items, metadata, prices, getStats, lastUpdate, isSyncing, fetchPrices } = useCollection();
  const { showToast } = useToast();

  const stats = getStats();

  const handleSync = async () => {
    if (isSyncing) return;
    try {
      await fetchPrices(true);
      showToast('Preise erfolgreich aktualisiert');
    } catch {
      showToast('Fehler beim Aktualisieren der Preise', 'error');
    }
  };

  // Derive "Top Performers" (highest gain per item)
  const topPerformers = useMemo(() => {
    return [...items]
      .map(item => {
        const currentPrice = prices[item.idProduct]?.trend || 0;
        const gain = currentPrice - (item.purchasePrice || 0);
        return { ...item, gain };
      })
      .sort((a, b) => b.gain - a.gain)
      .slice(0, 3);
  }, [items, prices]);

  // Derive "Recently Added"
  const recentlyAdded = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 3);
  }, [items]);

  const formattedDate = lastUpdate ? new Date(lastUpdate).toLocaleString('de-DE') : 'Unbekannt';

  // Collection breakdown (Singles vs. Sealed)
  const breakdown = useMemo(() => {
    const singles = items.filter(item => metadata[item.idProduct]?.type === 'Karte').reduce((sum, item) => sum + item.quantity, 0);
    const sealed = items.filter(item => metadata[item.idProduct]?.type === 'Sealed').reduce((sum, item) => sum + item.quantity, 0);
    const total = singles + sealed;
    return {
      singles: total > 0 ? (singles / total) * 100 : 50,
      sealed: total > 0 ? (sealed / total) * 100 : 50,
      singlesCount: singles,
      sealedCount: sealed
    };
  }, [items, metadata]);

  return (
    <div className="dashboard">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">Colma<span>TCG</span></h1>
        <button
          className={`sync-indicator ${isSyncing ? 'animate-spin' : ''}`}
          onClick={handleSync}
          disabled={isSyncing}
          title={`Zuletzt aktualisiert: ${formattedDate}`}
          style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '8px' }}
        >
          {isSyncing ? <RefreshCw size={20} className="text-accent" /> : <RefreshCw size={20} className="text-secondary" />}
        </button>
      </header>

      <div className="portfolio-card">
        <div className="portfolio-label">Portfolio Gesamtwert</div>
        <div className="portfolio-value">
          {stats.totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </div>
        <div className={`portfolio-change ${stats.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
          {stats.totalProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} ({stats.profitPercent.toFixed(1)}%)
        </div>
        <div className="text-secondary" style={{ fontSize: '10px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={10} /> Stand: {formattedDate} (Cardmarket)
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="stat-box">
          <div className="stat-label">Produkte</div>
          <div className="stat-value">{items.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Items Gesamt</div>
          <div className="stat-value">{stats.itemCount}</div>
        </div>
      </div>

      <section className="glass-panel" style={{ padding: '20px', marginBottom: '32px' }}>
        <div className="section-title" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={16} className="text-accent-secondary" /> Sammlung Breakdown
          </div>
        </div>
        <div className="breakdown-bar" style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '12px' }}>
          <div style={{ width: `${breakdown.singles}%`, background: 'var(--accent)', transition: 'width 0.5s ease' }}></div>
          <div style={{ width: `${breakdown.sealed}%`, background: 'var(--accent-secondary)', transition: 'width 0.5s ease' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
            <span className="text-secondary">Karten:</span> <strong>{breakdown.singlesCount}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-secondary)' }}></div>
            <span className="text-secondary">Sealed:</span> <strong>{breakdown.sealedCount}</strong>
          </div>
        </div>
      </section>

      {topPerformers.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <div className="section-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={16} className="text-accent" /> Top Performer
            </div>
          </div>
          <div className="product-list">
            {topPerformers.map(item => {
              const meta = metadata[item.idProduct] || { name: 'Lade...', set: '', idProduct: item.idProduct };
              const currentPrice = prices[item.idProduct]?.trend || 0;
              const gain = currentPrice - (item.purchasePrice || 0);
              return (
                <div key={item.idProduct} className="product-item">
                  <div className="product-image">
                    <img src={`https://static.cardmarket.com/img/products/1/${item.idProduct}.jpg`} alt="" />
                    <div className="holo-effect"></div>
                  </div>
                  <div className="product-info">
                    <div className="product-name">{meta.name}</div>
                    <div className="product-meta">Gain: <span className={gain >= 0 ? 'text-success' : 'text-danger'}>{gain >= 0 ? '+' : ''}{gain.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
                  </div>
                  <div className="product-price">
                    <div className="price-now">{currentPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section style={{ marginBottom: '32px' }}>
        <div className="section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} className="text-accent" /> Zuletzt Hinzugefügt
          </div>
          <Link to="/collection" className="view-all">Alle</Link>
        </div>
        <div className="product-list">
          {recentlyAdded.map(item => {
            const meta = metadata[item.idProduct] || { name: 'Lade...', set: '', idProduct: item.idProduct };
            const price = prices[item.idProduct]?.trend || 0;
            return (
              <div key={item.idProduct} className="product-item">
                <div className="product-image">
                   <img src={`https://static.cardmarket.com/img/products/1/${item.idProduct}.jpg`} alt="" />
                </div>
                <div className="product-info">
                  <div className="product-name">{meta.name}</div>
                  <div className="product-meta">{meta.set} • {item.quantity}x</div>
                </div>
                <div className="product-price">
                  <div className="price-now">{(price * item.quantity).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-center text-secondary glass-panel" style={{ padding: '40px 20px' }}>
              <div className="pokeball-loader"></div>
              <p style={{ marginTop: '16px' }}>Noch keine Produkte in der Sammlung.</p>
              <Link to="/cards" className="view-all" style={{ marginTop: '12px', display: 'inline-block' }}>Jetzt suchen</Link>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="section-title">Schnellzugriff</div>
        <Link to="/cards" className="product-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="btn-icon"><Plus size={24} /></div>
          <div className="product-info">
            <div className="product-name">Sammlung erweitern</div>
            <div className="product-meta">Neue Produkte in der Datenbank suchen</div>
          </div>
          <ChevronRight size={20} className="text-secondary" />
        </Link>
      </section>
    </div>
  );
}
