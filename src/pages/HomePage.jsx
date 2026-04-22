import { TrendingUp, TrendingDown, Plus, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, Clock, Trophy, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { useMemo } from 'react';
import germanProducts from '../data/germanProducts.json';

export default function HomePage() {
  const { items, metadata, prices, getStats, lastUpdate, isSyncing, fetchPrices } = useCollection();
  const { showToast } = useToast();

  const stats = getStats();

  const handleRefresh = async () => {
    try {
      await fetchPrices(true);
      showToast('Preise erfolgreich aktualisiert');
    } catch (e) {
      showToast('Fehler beim Aktualisieren der Preise', 'error');
    }
  };

  // Derive "Top Performers" (highest gain per item)
  const topPerformers = useMemo(() => {
    return [...items]
      .map(item => {
        const currentPrice = prices[item.idProduct]?.trend || 0;
        const purchasePrice = item.purchasePrice || 0;
        const gain = currentPrice - purchasePrice;
        const gainPercent = purchasePrice > 0 ? (gain / purchasePrice) * 100 : 0;
        return { ...item, gain, gainPercent, currentPrice };
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

  // Set Progress
  const setProgress = useMemo(() => {
    const sets = {};
    // Group all possible products by set
    germanProducts.forEach(p => {
      if (!sets[p.set]) sets[p.set] = { total: 0, owned: 0 };
      sets[p.set].total++;
    });

    // Count owned products per set
    items.forEach(item => {
      const meta = metadata[item.idProduct];
      if (meta && sets[meta.set]) {
        sets[meta.set].owned++;
      }
    });

    return Object.entries(sets)
      .map(([name, data]) => ({
        name,
        percent: Math.round((data.owned / data.total) * 100),
        owned: data.owned,
        total: data.total
      }))
      .filter(s => s.owned > 0)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 2);
  }, [items, metadata]);

  const formattedDate = lastUpdate ? new Date(lastUpdate).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Unbekannt';

  return (
    <div className="dashboard">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">Colma<span>TCG</span></h1>
        <button
          className={`sync-btn ${isSyncing ? 'animate-spin' : ''}`}
          onClick={handleRefresh}
          disabled={isSyncing}
          title={`Zuletzt aktualisiert: ${formattedDate}`}
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

      {setProgress.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <div className="section-title">
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={16} className="text-accent" /> Set-Fortschritt
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {setProgress.map(set => (
              <div key={set.name} className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '700' }}>
                  <span>{set.name}</span>
                  <span className="text-accent">{set.percent}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${set.percent}%`, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}></div>
                </div>
                <div className="text-secondary" style={{ fontSize: '11px', marginTop: '8px' }}>
                  {set.owned} von {set.total} Produkten gesammelt
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
              return (
                <div key={item.idProduct} className="product-item">
                  <div className="product-image">
                    <img src={`https://static.cardmarket.com/img/products/1/${item.idProduct}.jpg`} alt="" />
                    <div className="holo-effect"></div>
                  </div>
                  <div className="product-info">
                    <div className="product-name">{meta.name}</div>
                    <div className="product-meta">
                      Gewinn: <span className={item.gain >= 0 ? 'text-success' : 'text-danger'}>
                        {item.gain >= 0 ? '+' : ''}{item.gain.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  </div>
                  <div className="product-price">
                    <div className="price-now">{item.currentPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                    <div className={item.gainPercent >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '10px', fontWeight: '700' }}>
                      {item.gainPercent >= 0 ? '+' : ''}{item.gainPercent.toFixed(1)}%
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
            <div className="text-center text-secondary glass-panel" style={{ padding: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
              Noch keine Produkte in der Sammlung.<br/>
              <Link to="/cards" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '700', marginTop: '12px', display: 'inline-block' }}>Jetzt stöbern</Link>
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
