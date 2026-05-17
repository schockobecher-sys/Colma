import { TrendingUp, TrendingDown, Plus, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, Clock, Trophy, Sparkles, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useEffect, useState, useMemo } from 'react';
import germanProducts from '../data/germanProducts.json';

export default function HomePage() {
  const { items, metadata, prices, getStats, lastUpdate, isSyncing, fetchPrices } = useCollection();
  const [syncStatus, setSyncStatus] = useState('idle');

  const stats = getStats();

  // Status should be derived or set based on actual data
  const derivedSyncStatus = useMemo(() => {
    if (isSyncing) return 'loading';
    const lastFetch = localStorage.getItem('colma_last_fetch_time');
    const now = new Date().getTime();

    if (lastFetch && now - Number(lastFetch) < 1000 * 60 * 5) {
      return 'success';
    }
    if (Object.keys(prices).length > 0) {
      return 'success';
    }
    return 'idle';
  }, [prices, isSyncing]);

  useEffect(() => {
    setSyncStatus(derivedSyncStatus);
  }, [derivedSyncStatus]);

  // Derive "Top Performers" (highest absolute gain)
  const topPerformers = useMemo(() => {
    return [...items]
      .map(item => {
        const currentPrice = prices[item.idProduct]?.trend || 0;
        const gain = (currentPrice - (item.purchasePrice || 0)) * item.quantity;
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

  // Set Progress Calculation
  const setProgress = useMemo(() => {
    const trackedSets = ['151', 'Obsidianflammen', 'Gewalten der Zeit'];
    return trackedSets.map(setName => {
      const setProducts = germanProducts.filter(p => p.set === setName && p.type === 'Karte');
      const ownedInSet = items.filter(item => {
        const meta = metadata[item.idProduct] || germanProducts.find(p => p.idProduct === item.idProduct);
        return meta?.set === setName && meta?.type === 'Karte';
      });

      const total = setProducts.length || 1; // Avoid div by zero
      const owned = ownedInSet.length;
      const percent = Math.round((owned / total) * 100);

      return { name: setName, owned, total, percent };
    });
  }, [items, metadata]);

  // Collection Breakdown
  const breakdown = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      const type = metadata[item.idProduct]?.type || 'Unbekannt';
      acc[type] = (acc[type] || 0) + item.quantity;
      return acc;
    }, {});

    const total = stats.itemCount || 1;
    return {
      karte: Math.round(((counts['Karte'] || 0) / total) * 100),
      sealed: Math.round(((counts['Sealed'] || 0) / total) * 100)
    };
  }, [items, metadata, stats.itemCount]);

  const formattedDate = lastUpdate ? new Date(lastUpdate).toLocaleString('de-DE') : 'Unbekannt';

  return (
    <div className="dashboard">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">Colma<span>TCG</span></h1>
        <button
          className="sync-indicator-btn"
          onClick={() => fetchPrices(true)}
          disabled={isSyncing}
          title={`Zuletzt aktualisiert: ${formattedDate}. Klicken zum Aktualisieren.`}
          style={{ background: 'transparent', border: 'none', padding: '8px' }}
        >
          {syncStatus === 'loading' && <RefreshCw size={18} className="text-accent animate-spin" />}
          {syncStatus === 'success' && <CheckCircle2 size={18} className="text-success" />}
          {syncStatus === 'idle' && <RefreshCw size={18} className="text-secondary" />}
          {syncStatus === 'error' && <AlertCircle size={18} className="text-danger" />}
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

      <div className="grid-2" style={{ marginBottom: '32px' }}>
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
            <BarChart3 size={16} className="text-accent-secondary" /> Collection Breakdown
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: `${breakdown.karte}%`, background: 'var(--accent)', transition: 'width 0.5s ease' }}></div>
            <div style={{ width: `${breakdown.sealed}%`, background: 'var(--accent-secondary)', transition: 'width 0.5s ease' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent)' }}></div>
              Karten ({breakdown.karte}%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent-secondary)' }}></div>
              Sealed ({breakdown.sealed}%)
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <div className="section-title">Set Progress</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {setProgress.map(set => (
            <div key={set.name} className="glass-panel" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                <span>{set.name}</span>
                <span className="text-accent">{set.owned} / {set.total}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${set.percent}%`, height: '100%', background: 'var(--accent)', transition: 'width 1s ease' }}></div>
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
              const currentPrice = prices[item.idProduct]?.trend || 0;
              const gain = (currentPrice - (item.purchasePrice || 0)) * item.quantity;
              return (
                <div key={item.idProduct} className="product-item">
                  <div className="product-image">
                    <img src={`https://static.cardmarket.com/img/products/1/${item.idProduct}.jpg`} alt="" />
                    {meta.type === 'Karte' && <div className="holo-effect"></div>}
                  </div>
                  <div className="product-info">
                    <div className="product-name">{meta.name}</div>
                    <div className="product-meta">Profit: <span className={gain >= 0 ? 'text-success' : 'text-danger'}>{gain >= 0 ? '+' : ''}{gain.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
                  </div>
                  <div className="product-price">
                    <div className="price-now">{(currentPrice * item.quantity).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
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
