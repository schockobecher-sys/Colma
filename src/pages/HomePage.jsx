import { TrendingUp, TrendingDown, Plus, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, Clock, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useEffect, useState, useMemo } from 'react';

export default function HomePage() {
  const { items, metadata, prices, getStats, lastUpdate, setPrices } = useCollection();
  const [syncStatus, setSyncStatus] = useState('idle');
  const [isSyncing, setIsSyncing] = useState(false);

  const stats = getStats();

  // Status should be derived or set based on actual data
  const derivedSyncStatus = useMemo(() => {
    const lastFetch = localStorage.getItem('colma_last_fetch_time');
    const now = new Date().getTime();

    if (lastFetch && now - Number(lastFetch) < 1000 * 60 * 5) {
      return 'success';
    }
    if (Object.keys(prices).length > 0) {
      return 'success';
    }
    return 'loading';
  }, [prices]);

  // If we still want to use state for some reason (e.g. manual refresh)
  useEffect(() => {
    setSyncStatus(derivedSyncStatus);
  }, [derivedSyncStatus]);

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

  const setProgress = useMemo(() => {
    const set151Total = 210; // Approx total for 151
    const set151Owned = items.filter(item => metadata[item.idProduct]?.set === '151').length;
    return Math.min(100, (set151Owned / set151Total) * 100);
  }, [items, metadata]);

  const collectionBreakdown = useMemo(() => {
    const total = items.length || 1;
    const cards = items.filter(item => metadata[item.idProduct]?.type === 'Karte').length;
    const sealed = items.filter(item => metadata[item.idProduct]?.type === 'Sealed').length;
    return {
      cards: (cards / total) * 100,
      sealed: (sealed / total) * 100
    };
  }, [items, metadata]);

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      const { CardmarketService } = await import('../services/CardmarketService');
      const result = await CardmarketService.fetchPriceGuide();
      if (result) {
        setPrices(result.prices);
        localStorage.setItem('colma_prices', JSON.stringify(result.prices));
        localStorage.setItem('colma_last_update', result.updatedAt);
        localStorage.setItem('colma_last_fetch_time', new Date().getTime().toString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">Colma<span>TCG</span></h1>
        <div className="sync-indicator" title={`Zuletzt aktualisiert: ${formattedDate}`}>
          {syncStatus === 'loading' && <RefreshCw size={16} className="text-secondary animate-spin" />}
          {syncStatus === 'success' && <CheckCircle2 size={16} className="text-success" />}
          {syncStatus === 'error' && <AlertCircle size={16} className="text-danger" />}
        </div>
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

      <div className="dashboard-bento" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div className="stat-box glass-panel">
          <div className="stat-label">Produkte</div>
          <div className="stat-value">{items.length}</div>
        </div>
        <div className="stat-box glass-panel">
          <div className="stat-label">Items Gesamt</div>
          <div className="stat-value">{stats.itemCount}</div>
        </div>
        <div className="stat-box glass-panel" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="stat-label">Preis-Sync</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formattedDate}</div>
          </div>
          <button
            className={`btn-icon ${isSyncing ? 'animate-spin' : ''}`}
            onClick={handleRefresh}
            disabled={isSyncing}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <section style={{ marginBottom: '32px' }}>
        <div className="section-title">Sammlungs-Status</div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>Set Fortschritt (151)</span>
              <span className="text-accent">{setProgress.toFixed(1)}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${setProgress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>Verteilung</span>
              <span style={{ color: 'var(--text-secondary)' }}>{Math.round(collectionBreakdown.cards)}% Karte / {Math.round(collectionBreakdown.sealed)}% Sealed</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${collectionBreakdown.cards}%`, height: '100%', background: '#ff4b4b' }}></div>
              <div style={{ width: `${collectionBreakdown.sealed}%`, height: '100%', background: '#2a75bb' }}></div>
            </div>
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
