import { TrendingUp, TrendingDown, Plus, ChevronRight, RefreshCw, CheckCircle2, Clock, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useMemo } from 'react';

export default function HomePage() {
  const { items, metadata, prices, getStats, lastUpdate, isSyncing, fetchPrices } = useCollection();

  const stats = getStats();

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

  // Set Progress Calculation
  const setProgress = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      const set = metadata[item.idProduct]?.set;
      if (set) acc[set] = (acc[set] || 0) + 1;
      return acc;
    }, {});

    const setTotals = {
      '151': 10, // Just examples based on germanProducts.json
      'Obsidianflammen': 2,
      'Gewalten der Zeit': 2
    };

    return Object.entries(setTotals).map(([name, total]) => ({
      name,
      total,
      count: Math.min(counts[name] || 0, total),
      percent: Math.round((Math.min(counts[name] || 0, total) / total) * 100)
    }));
  }, [items, metadata]);

  // Breakdown calculation
  const breakdown = useMemo(() => {
    const karte = items.filter(i => metadata[i.idProduct]?.type === 'Karte').length;
    const sealed = items.filter(i => metadata[i.idProduct]?.type === 'Sealed').length;
    const total = karte + sealed || 1;
    return {
      karte: (karte / total) * 100,
      sealed: (sealed / total) * 100,
      karteCount: karte,
      sealedCount: sealed
    };
  }, [items, metadata]);

  return (
    <div className="dashboard">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">Colma<span>TCG</span></h1>
        <button
          className="sync-indicator"
          onClick={() => fetchPrices(true)}
          disabled={isSyncing}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          title={`Zuletzt aktualisiert: ${formattedDate}`}
        >
          {isSyncing ? (
            <RefreshCw size={16} className="text-secondary animate-spin" />
          ) : (
            <CheckCircle2 size={16} className="text-success" />
          )}
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

      <div className="grid-2" style={{ marginBottom: '16px' }}>
        <div className="stat-box">
          <div className="stat-label">Produkte</div>
          <div className="stat-value">{items.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Items Gesamt</div>
          <div className="stat-value">{stats.itemCount}</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '32px' }}>
        <div className="stat-label" style={{ marginBottom: '12px' }}>Sammlungs-Aufteilung</div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '12px' }}>
          <div style={{ width: `${breakdown.karte}%`, background: 'var(--accent)', transition: 'width 0.5s ease' }}></div>
          <div style={{ width: `${breakdown.sealed}%`, background: 'var(--accent-secondary)', transition: 'width 0.5s ease' }}></div>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontWeight: '700' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent)' }}></div>
            <span className="text-secondary">Karten ({breakdown.karteCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent-secondary)' }}></div>
            <span className="text-secondary">Sealed ({breakdown.sealedCount})</span>
          </div>
        </div>
      </div>

      {setProgress.length > 0 && items.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <div className="section-title">Set-Fortschritt</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {setProgress.map(set => (
              <div key={set.name} className="glass-panel" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                  <span>{set.name}</span>
                  <span className="text-accent">{set.percent}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${set.percent}%`, height: '100%', background: 'var(--accent)', transition: 'width 1s ease' }}></div>
                </div>
                <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  {set.count} von {set.total} gesammelt
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
