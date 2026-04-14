import { TrendingUp, TrendingDown, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { useEffect, useState } from 'react';
import { CardmarketService } from '../services/CardmarketService';

export default function HomePage() {
  const { items, setPrices, setMetadata, metadata, prices, getStats } = useCollection();
  const [loading, setLoading] = useState(true);

  const stats = getStats();

  useEffect(() => {
    async function initData() {
      // In a real app, this might be a background sync
      const priceData = await CardmarketService.fetchPriceGuide();
      if (priceData) {
        setPrices(priceData);
        localStorage.setItem('colma_prices', JSON.stringify(priceData));
      }

      // Fetch metadata for collection items
      const meta = {};
      for (const item of items) {
        meta[item.idProduct] = await CardmarketService.getProductMetadata(item.idProduct);
      }
      setMetadata(prev => ({ ...prev, ...meta }));
      setLoading(false);
    }

    initData();
  }, [items.length]); // Re-run if collection size changes

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1 className="app-title">Colma<span>TCG</span></h1>
      </header>

      <div className="portfolio-card">
        <div className="portfolio-label">Gesamtwert Portfolio</div>
        <div className="portfolio-value">
          {stats.totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </div>
        <div className={`portfolio-change ${stats.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
          {stats.totalProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}€ ({stats.profitPercent.toFixed(1)}%) Gesamt
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
                  <div className="price-now">{(price * item.quantity).toFixed(2)} €</div>
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
              <div className="product-name">Neues Produkt scannen</div>
              <div className="product-meta">Suche in der Datenbank</div>
            </div>
            <ChevronRight size={16} className="text-secondary" />
          </Link>
        </div>
      </section>
    </div>
  );
}
