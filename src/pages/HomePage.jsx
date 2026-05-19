import { TrendingUp, TrendingDown, RefreshCw, Clock, Trophy, Sparkles, PieChart, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { useMemo } from 'react';

export default function HomePage() {
  const { items, metadata, prices, getStats, lastUpdate, isSyncing, fetchPrices } = useCollection();
  const { showToast } = useToast();

  const stats = getStats();
  const formattedDate = lastUpdate ? new Date(lastUpdate).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--:--';

  const handleRefresh = async () => {
    try {
      await fetchPrices(true);
      showToast('Preise erfolgreich aktualisiert');
    } catch (err) {
      console.error(err);
      showToast('Fehler beim Aktualisieren', 'error');
    }
  };

  // Portfolio Breakdown (Cards vs Sealed)
  const breakdown = useMemo(() => {
    let cardValue = 0;
    let sealedValue = 0;

    items.forEach(item => {
      const meta = metadata[item.idProduct];
      const price = prices[item.idProduct]?.trend || 0;
      const total = price * item.quantity;

      if (meta?.type === 'Sealed') sealedValue += total;
      else cardValue += total;
    });

    const total = cardValue + sealedValue || 1;
    return {
      card: (cardValue / total) * 100,
      sealed: (sealedValue / total) * 100,
      cardValue,
      sealedValue
    };
  }, [items, metadata, prices]);

  // Set Progress (Curated selection)
  const setProgress = useMemo(() => {
    const sets = [
      { name: '151', total: 210 },
      { name: 'Obsidianflammen', total: 230 },
      { name: 'Gewalten der Zeit', total: 218 }
    ];

    return sets.map(s => {
      const owned = items.filter(item => metadata[item.idProduct]?.set === s.name).length;
      return { ...s, owned, percent: (owned / s.total) * 100 };
    });
  }, [items, metadata]);

  return (
    <div className="dashboard">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">Colma<span>TCG</span></h1>
        <button
          className={`sync-button ${isSyncing ? 'spinning' : ''}`}
          onClick={handleRefresh}
          disabled={isSyncing}
          style={{ background: 'transparent', color: 'var(--text-secondary)' }}
        >
          <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="portfolio-card glass-panel">
        <div className="portfolio-label">Portfolio Wert</div>
        <div className="portfolio-value">
          {stats.totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </div>
        <div className={`portfolio-change ${stats.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
          {stats.totalProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} ({stats.profitPercent.toFixed(1)}%)
        </div>
        <div className="text-secondary" style={{ fontSize: '10px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={10} /> Stand: {formattedDate}
        </div>
      </div>

      <div className="dashboard-bento" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="stat-box glass-panel">
          <div className="stat-label"><PieChart size={12} style={{ marginBottom: '-2px', marginRight: '4px' }}/> Verteilung</div>
          <div className="breakdown-bar" style={{ height: '8px', background: '#333', borderRadius: '4px', marginTop: '8px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${breakdown.card}%`, background: 'var(--accent-secondary)' }} />
            <div style={{ width: `${breakdown.sealed}%`, background: 'var(--accent)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginTop: '6px', fontWeight: '700' }}>
            <span style={{ color: 'var(--accent-secondary)' }}>CARDS</span>
            <span style={{ color: 'var(--accent)' }}>SEALED</span>
          </div>
        </div>

        <div className="stat-box glass-panel">
          <div className="stat-label"><LayoutGrid size={12} style={{ marginBottom: '-2px', marginRight: '4px' }}/> Gesamt</div>
          <div className="stat-value" style={{ fontSize: '24px', marginTop: '4px' }}>{stats.itemCount}</div>
          <div className="text-secondary" style={{ fontSize: '10px' }}>Items in {stats.uniqueCount} Positionen</div>
        </div>
      </div>

      <section style={{ marginBottom: '24px' }}>
        <div className="section-title">
          <span><Trophy size={14} className="text-accent" style={{ marginRight: '6px' }} /> Set Fortschritt</span>
        </div>
        <div className="set-progress-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {setProgress.map(set => (
            <div key={set.name} className="glass-panel" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700' }}>{set.name}</span>
                <span className="text-secondary">{set.owned} / {set.total} ({set.percent.toFixed(0)}%)</span>
              </div>
              <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${set.percent}%`, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <div className="section-title">
          <span><Sparkles size={14} className="text-accent" style={{ marginRight: '6px' }} /> Top Performer</span>
        </div>
        <div className="product-list">
          {items
            .map(item => ({ ...item, profit: (prices[item.idProduct]?.trend || 0) - (item.purchasePrice || 0) }))
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 2)
            .map(item => {
              const meta = metadata[item.idProduct] || { name: 'Lade...' };
              const price = prices[item.idProduct]?.trend || 0;
              return (
                <div key={item.idProduct} className="product-item glass-panel">
                  <div className="product-image"><img src={`https://static.cardmarket.com/img/products/1/${item.idProduct}.jpg`} alt="" /><div className="holo-effect"></div></div>
                  <div className="product-info">
                    <div className="product-name">{meta.name}</div>
                    <div className="text-success" style={{ fontSize: '12px', fontWeight: '700' }}>
                      +{item.profit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} Profit
                    </div>
                  </div>
                  <div className="price-now">{price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                </div>
              );
            })
          }
        </div>
      </section>
    </div>
  );
}
