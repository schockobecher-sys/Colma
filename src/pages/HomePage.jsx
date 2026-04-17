import { TrendingUp, TrendingDown, Plus, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, Clock, Trophy, Sparkles, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useEffect, useState, useMemo } from 'react';
import germanProducts from '../data/germanProducts.json';

export default function HomePage() {
  const { items, metadata, prices, getStats, lastUpdate } = useCollection();
  const [syncStatus, setSyncStatus] = useState('idle');

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
        const purchasePrice = item.purchasePrice || currentPrice; // Fallback to current if not set
        const gain = currentPrice - purchasePrice;
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

  // Calculate set progress for discovered sets
  const setProgress = useMemo(() => {
    // Count items per set in the full database
    const setCounts = germanProducts.reduce((acc, p) => {
      if (p.type === 'Karte') {
        acc[p.set] = (acc[p.set] || 0) + 1;
      }
      return acc;
    }, {});

    // Find sets that have at least 1 card and are "relevant" (e.g. top 4 by card count or owned cards)
    const ownedSets = new Set(items.map(item => metadata[item.idProduct]?.set).filter(Boolean));
    const allSets = Object.keys(setCounts);

    // Sort sets by how many cards we own from them, then by total cards
    const sortedSets = allSets.sort((a, b) => {
      const ownedA = items.filter(i => metadata[i.idProduct]?.set === a).length;
      const ownedB = items.filter(i => metadata[i.idProduct]?.set === b).length;
      if (ownedB !== ownedA) return ownedB - ownedA;
      return setCounts[b] - setCounts[a];
    }).slice(0, 4);

    return sortedSets.map(setName => {
      const allInSet = germanProducts.filter(p => p.set === setName && p.type === 'Karte');
      const ownedInSet = items.filter(item => {
        const meta = metadata[item.idProduct];
        return meta && meta.set === setName && meta.type === 'Karte';
      });

      const percent = allInSet.length > 0 ? (ownedInSet.length / allInSet.length) * 100 : 0;

      return {
        name: setName,
        total: allInSet.length,
        owned: ownedInSet.length,
        percent: Math.round(percent)
      };
    });
  }, [items, metadata]);

  const formattedDate = lastUpdate ? new Date(lastUpdate).toLocaleString('de-DE') : 'Unbekannt';

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
            <LayoutGrid size={16} className="text-accent" /> Set Fortschritt
          </div>
        </div>
        <div className="grid-2" style={{ gap: '12px' }}>
          {setProgress.map(set => (
            <div key={set.name} className="stat-box" style={{ padding: '16px' }}>
              <div className="stat-box-inner">
                <div className="stat-label" style={{ marginBottom: 0 }}>{set.name}</div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent)' }}>{set.percent}%</div>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${set.percent}%` }}></div>
              </div>
              <div className="set-progress-meta">{set.owned} / {set.total} Karten</div>
            </div>
          ))}
          {setProgress.length === 0 && (
            <div className="text-secondary" style={{ fontSize: '12px', gridColumn: 'span 2' }}>Keine Sets gefunden.</div>
          )}
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
              const currentPrice = item.currentPrice || 0;
              const gain = item.gain || 0;
              return (
                <div key={item.idProduct} className="product-item-container">
                  <div className="product-item">
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
              <div key={item.idProduct} className="product-item-container">
                <div className="product-item">
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
        <div className="product-item-container">
          <Link to="/cards" className="product-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="btn-icon"><Plus size={24} /></div>
            <div className="product-info">
              <div className="product-name">Sammlung erweitern</div>
              <div className="product-meta">Neue Produkte in der Datenbank suchen</div>
            </div>
            <ChevronRight size={20} className="text-secondary" />
          </Link>
        </div>
      </section>
    </div>
  );
}
