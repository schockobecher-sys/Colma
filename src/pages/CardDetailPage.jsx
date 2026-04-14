import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, TrendingUp, TrendingDown, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { CardmarketService } from '../services/CardmarketService';
import { useCollection } from '../context/CollectionContext';

export default function CardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items, prices } = useCollection();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const idProduct = parseInt(id);
  const userItem = items.find(i => i.idProduct === idProduct);
  const priceData = prices[idProduct] || {};

  useEffect(() => {
    async function load() {
      const p = await CardmarketService.getProduct(idProduct);
      setProduct(p);
      setLoading(false);
    }
    load();
  }, [idProduct]);

  if (loading) return (
      <div className="sync-overlay">
          <div className="pokeball-loader"></div>
      </div>
  );

  if (!product) return (
      <div className="main-content text-center">
          <h2>Produkt nicht gefunden</h2>
          <button onClick={() => navigate(-1)} className="btn-secondary">Zurück</button>
      </div>
  );

  const handleAdd = () => {
      addItem(product.idProduct, quantity, priceData.trend || 0);

      // Play a soft "gaming" sound
      try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
          oscillator.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.1); // E6

          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.2);

          if (window.navigator.vibrate) {
              window.navigator.vibrate(50);
          }
      } catch (e) {
          console.warn('Audio feedback failed', e);
      }
  };

  return (
    <div className="detail-page fade-in">
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '8px' }}>
            <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px' }}>Details</h2>
      </header>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div className="item-img-container holo-effect" style={{ width: '200px', height: '280px', borderRadius: '12px' }}>
                <img
                    src={`https://static.cardmarket.com/img/products/1/${product.idProduct}.jpg`}
                    alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x280/10141e/ffffff?text=No+Image'; }}
                />
            </div>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', textAlign: 'center' }}>{product.name}</h1>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '24px' }}>
            {product.categoryName} • ID {product.idProduct}
        </p>

        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="portfolio-label">Trend Preis</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--pk-yellow)' }}>
                    {priceData.trend?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '---'}
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="portfolio-label">Günstigstes</div>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>
                    {priceData.low?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '---'}
                </div>
            </div>
        </div>

        {priceData.avg1 && (
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', background: 'rgba(59, 76, 202, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={16} className="text-accent" />
                        <span style={{ fontWeight: 700 }}>Marktanalyse</span>
                    </div>
                    <div className={priceData.trend > priceData.avg30 ? 'text-success' : 'text-danger'} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800 }}>
                        {priceData.trend > priceData.avg30 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {Math.abs(((priceData.trend - priceData.avg30) / priceData.avg30) * 100).toFixed(1)}%
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px' }}>
                    <div><span className="text-muted">Avg 7d:</span> {priceData.avg7} €</div>
                    <div><span className="text-muted">Avg 30d:</span> {priceData.avg30} €</div>
                </div>
            </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-deep)', borderRadius: '12px', padding: '4px' }}>
                <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ background: 'none', border: 'none', color: '#fff', padding: '10px' }}
                >
                    <Minus size={20} />
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 800, fontSize: '18px' }}>{quantity}</span>
                <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ background: 'none', border: 'none', color: '#fff', padding: '10px' }}
                >
                    <Plus size={20} />
                </button>
            </div>
            <button className="btn-primary" onClick={handleAdd}>
                {userItem ? 'Menge erhöhen' : 'Zur Sammlung'}
            </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href={`https://www.cardmarket.com/de/Pokemon/Products/Singles/${product.idProduct}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none' }}
          >
              Auf Cardmarket ansehen <ExternalLink size={18} />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>
              <ShieldCheck size={14} /> Alle Daten werden live von Cardmarket synchronisiert
          </div>
      </div>
    </div>
  );
}
