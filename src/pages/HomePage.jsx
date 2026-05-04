import { TrendingUp, TrendingDown, Plus, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, Clock, Trophy, Sparkles, BarChart3, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { useEffect, useState, useMemo } from 'react';

export default function HomePage() {
  const { items, metadata, prices, getStats, lastUpdate, isSyncing, fetchPrices } = useCollection();
  const { showToast } = useToast();

  const stats = getStats();

  const handleSync = async () => {
    const success = await fetchPrices(true);
    if (success) {
      showToast('Preise erfolgreich aktualisiert');
    } else {
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

  const breakdown = useMemo(() => {
    const counts = { Karte: 0, Sealed: 0 };
    items.forEach(item => {
      const type = metadata[item.idProduct]?.type || 'Karte';
      counts[type] += item.quantity;
    });
    const total = counts.Karte + counts.Sealed;
    return {
      cards: total > 0 ? (counts.Karte / total) * 100 : 0,
      sealed: total > 0 ? (counts.Sealed / total) * 100 : 0,
      cardCount: counts.Karte,
      sealedCount: counts.Sealed
    };
  }, [items, metadata]);

  const setProgress = useMemo(() => {
    const sets = ['151', 'Obsidianflammen', 'Gewalten der Zeit'];
    return sets.map(setName => {
      // In a real app we'd need the total count per set from the database
      // For now, we'll use approximate totals for 151 (210), Obsidianflammen (230), etc.
      const totals = { '151': 165, 'Obsidianflammen': 197, 'Gewalten der Zeit': 162 };
      const uniqueInSet = items.filter(item => {
        const meta = metadata[item.idProduct];
        return meta?.set === setName && meta?.type === 'Karte';
      }).length;

      const total = totals[setName] || 200;
      return {
        name: setName,
        owned: uniqueInSet,
        total: total,
        percent: Math.min(100, (uniqueInSet / total) * 100)
      };
    });
  }, [items, metadata]);

  return (
    <div className="dashboard">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">Colma<span>TCG</span></h1>
        <button
          className="sync-button"
          onClick={handleSync}
          disabled={isSyncing}
          title={`Zuletzt aktualisiert: ${formattedDate}`}
          style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          {isSyncing ? (
            <RefreshCw size={18} className="text-accent animate-spin" />
          ) : (
            <CheckCircle2 size={18} className="text-success" />
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
            <BarChart3 size={16} className="text-accent" /> Sammlung-Breakdown
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="breakdown-bar" style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', display: 'flex', marginBottom: '16px' }}>
            <div style={{ width: `${breakdown.cards}%`, background: 'var(--accent)', transition: 'width 1s ease' }}></div>
            <div style={{ width: `${breakdown.sealed}%`, background: 'var(--accent-secondary)', transition: 'width 1s ease' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
              <span style={{ fontSize: '12px', fontWeight: '700' }}>Karten ({breakdown.cardCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-secondary)' }}></div>
              <span style={{ fontSize: '12px', fontWeight: '700' }}>Sealed ({breakdown.sealedCount})</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <div className="section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} className="text-accent" /> Set Fortschritt
          </div>
        </div>
        <div className="grid-2">
          {setProgress.map(set => (
            <div key={set.name} className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>{set.name}</div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${set.percent}%`, height: '100%', background: 'var(--success)', transition: 'width 1.5s ease' }}></div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{set.owned} / {set.total}</span>
                <span>{set.percent.toFixed(0)}%</span>
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
