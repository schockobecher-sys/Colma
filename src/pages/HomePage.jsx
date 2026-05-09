import { TrendingUp, TrendingDown, Plus, ChevronRight, RefreshCw, Clock, Trophy, Sparkles, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { useMemo } from 'react';

export default function HomePage() {
  const { items, metadata, prices, getStats, lastUpdate, isSyncing, fetchPrices } = useCollection();
  const { showToast } = useToast();

  const stats = getStats();

  const handleRefresh = async () => {
    try {
      await fetchPrices(true);
      showToast('Preise aktualisiert');
    } catch (err) {
      console.error(err);
      showToast('Update fehlgeschlagen', 'error');
    }
  };

  // Derive "Top Performers"
  const topPerformers = useMemo(() => {
    return [...items]
      .map(item => {
        const currentPrice = prices[item.idProduct]?.trend || 0;
        const gain = (currentPrice - (item.purchasePrice || 0)) * item.quantity;
        return { ...item, gain, currentPrice };
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

  // Set Progress Calculations
  const setProgress = useMemo(() => {
    const counts = { '151': 0, 'Obsidianflammen': 0, 'Gewalten der Zeit': 0 };
    items.forEach(item => {
      const meta = metadata[item.idProduct];
      if (meta && counts[meta.set] !== undefined) {
        counts[meta.set]++;
      }
    });
    return [
      { name: '151', current: counts['151'], total: 10 },
      { name: 'Obsidianflammen', current: counts['Obsidianflammen'], total: 5 },
      { name: 'Gewalten der Zeit', current: counts['Gewalten der Zeit'], total: 5 }
    ];
  }, [items, metadata]);

  // Collection Breakdown (Karte vs Sealed)
  const breakdown = useMemo(() => {
    let singles = 0;
    let sealed = 0;
    items.forEach(item => {
      const meta = metadata[item.idProduct];
      if (meta?.type === 'Karte') singles += (prices[item.idProduct]?.trend || 0) * item.quantity;
      if (meta?.type === 'Sealed') sealed += (prices[item.idProduct]?.trend || 0) * item.quantity;
    });
    const total = singles + sealed || 1;
    return {
      singlesPercent: (singles / total) * 100,
      sealedPercent: (sealed / total) * 100
    };
  }, [items, metadata, prices]);

  const formattedDate = lastUpdate ? new Date(lastUpdate).toLocaleString('de-DE') : 'Unbekannt';

  return (
    <div className="dashboard">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">Colma<span>TCG</span></h1>
        <button
          className={`sync-btn ${isSyncing ? 'animate-spin' : ''}`}
          onClick={handleRefresh}
          disabled={isSyncing}
          title="Preise aktualisieren"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
        >
          <RefreshCw size={20} />
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

        <div className="collection-breakdown-bar" style={{ marginTop: '24px' }}>
          <div className="breakdown-segment singles" style={{ width: `${breakdown.singlesPercent}%` }}></div>
          <div className="breakdown-segment sealed" style={{ width: `${breakdown.sealedPercent}%` }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'var(--text-secondary)' }}>
          <span>Karten: {breakdown.singlesPercent.toFixed(0)}%</span>
          <span>Sealed: {breakdown.sealedPercent.toFixed(0)}%</span>
        </div>

        <div className="text-secondary" style={{ fontSize: '10px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={10} /> Stand: {formattedDate} (Cardmarket)
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="stat-box">
          <div className="stat-label">Produkte</div>
          <div className="stat-value">{items.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Items Gesamt</div>
          <div className="stat-value">{stats.itemCount}</div>
        </div>
      </div>

      <section style={{ marginBottom: '32px' }}>
        <div className="section-title">
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} className="text-accent" /> Set Fortschritt
            </div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {setProgress.map(set => (
            <div key={set.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700' }}>{set.name}</span>
                <span className="text-secondary">{set.current} / {set.total}</span>
              </div>
              <div className="progress-bg" style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                <div
                  className="progress-fill"
                  style={{
                    height: '100%',
                    background: 'var(--accent)',
                    width: `${Math.min(100, (set.current / set.total) * 100)}%`,
                    transition: 'width 1s ease-out'
                  }}
                ></div>
              </div>
            </div>
          ))}
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
              return (
                <div key={item.idProduct} className="product-item">
                  <div className="product-image">
                    <img src={`https://static.cardmarket.com/img/products/1/${item.idProduct}.jpg`} alt="" />
                    <div className="holo-effect"></div>
                  </div>
                  <div className="product-info">
                    <div className="product-name">{meta.name}</div>
                    <div className="product-meta">Gain: <span className={item.gain >= 0 ? 'text-success' : 'text-danger'}>{item.gain >= 0 ? '+' : ''}{item.gain.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
                  </div>
                  <div className="product-price">
                    <div className="price-now">{item.currentPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
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
            <div className="text-center text-secondary glass-panel" style={{ padding: '30px' }}>
              Noch keine Produkte in der Sammlung.
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
