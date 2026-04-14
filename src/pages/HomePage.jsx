import { TrendingUp, TrendingDown, Plus, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useEffect, useState } from 'react';
import { CardmarketService } from '../services/CardmarketService';

export default function HomePage() {
  const { items, setPrices, setMetadata, metadata, prices, getStats, lastUpdate } = useCollection();
  const [syncStatus, setSyncStatus] = useState('idle');

  const stats = getStats();

  useEffect(() => {
    async function initData() {
      // Data is managed by CollectionContext, we just reflect status here
      const lastFetch = localStorage.getItem('colma_last_fetch_time');
      const now = new Date().getTime();

      if (lastFetch && now - Number(lastFetch) < 1000 * 60 * 5) {
        setSyncStatus('success');
      } else {
        setSyncStatus('loading');
        // The Context will handle the actual fetch
      }
    }
    initData();
  }, [prices]);

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
        <div className="portfolio-label">Gesamtwert Portfolio</div>
        <div className="portfolio-value">
          {stats.totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </div>
        <div className={`portfolio-change ${stats.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
          {stats.totalProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} ({stats.profitPercent.toFixed(1)}%) Gesamt
        </div>
        <div className="text-secondary" style={{ fontSize: '10px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={10} /> Stand: {formattedDate} (Cardmarket)
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="stat-box">
          <div className="stat-label">Produkte</div>
          <div className="stat-value">{items.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Gesamtanzahl</div>
          <div className="stat-value">{stats.itemCount}</div>
        </div>
      </div>

      <section style={{ marginBottom: '24px' }}>
        <div className="section-title">
          Deine Sammlung
          <Link to="/collection" className="view-all">Alle sehen</Link>
        </div>
        <div className="product-list">
          {items.slice(0, 3).map(item => {
            const meta = metadata[item.idProduct] || { name: 'Lade...', set: '', image: '⏳' };
            const price = prices[item.idProduct]?.trend || 0;
            return (
              <div key={item.idProduct} className="product-item">
                <div className="product-image">{meta.image}</div>
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
            <div className="text-center text-secondary" style={{ padding: '20px' }}>
              Noch keine Produkte in der Sammlung.
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="section-title">
          Hinzufügen
          <Link to="/cards" className="view-all"><Plus size={18} /></Link>
        </div>
        <div className="product-list">
          <Link to="/cards" className="product-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="product-image"><Plus size={20} /></div>
            <div className="product-info">
              <div className="product-name">Neues Produkt suchen</div>
              <div className="product-meta">In der Datenbank stöbern</div>
            </div>
            <ChevronRight size={16} className="text-secondary" />
          </Link>
        </div>
      </section>
    </div>
  );
}
