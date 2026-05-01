import { TrendingUp, TrendingDown, Plus, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, Clock, Trophy, Sparkles, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useEffect, useState, useMemo } from 'react';
import ProductListItem from '../components/ProductListItem';

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

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px' }}>
        <div className="section-title" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={14} /> Sammlung Aufteilung
          </div>
        </div>
        <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
          {(() => {
            const cards = items.filter(i => metadata[i.idProduct]?.type === 'Karte').reduce((sum, i) => sum + i.quantity, 0);
            const sealed = items.filter(i => metadata[i.idProduct]?.type === 'Sealed').reduce((sum, i) => sum + i.quantity, 0);
            const total = cards + sealed || 1;
            return (
              <>
                <div style={{ width: `${(cards / total) * 100}%`, background: 'var(--accent)', transition: 'width 1s ease' }}></div>
                <div style={{ width: `${(sealed / total) * 100}%`, background: 'var(--accent-secondary)', transition: 'width 1s ease' }}></div>
              </>
            );
          })()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
          <div style={{ color: 'var(--accent)' }}>Karten</div>
          <div style={{ color: 'var(--accent-secondary)' }}>Sealed</div>
        </div>
      </div>

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
              return (
                <ProductListItem
                  key={item.idProduct}
                  product={meta}
                  price={currentPrice}
                  quantity={item.quantity}
                  isLoading={syncStatus === 'loading'}
                />
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
