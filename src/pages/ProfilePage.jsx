import { User, LogOut, Settings, Bell, Shield, Info, HelpCircle } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export default function ProfilePage() {
  const { getStats } = useCollection();
  const stats = getStats();

  const menuItems = [
    { icon: <Settings size={20} />, label: 'Einstellungen' },
    { icon: <Bell size={20} />, label: 'Benachrichtigungen' },
    { icon: <Shield size={20} />, label: 'Datenschutz' },
    { icon: <Info size={20} />, label: 'Über Colma' },
    { icon: <HelpCircle size={20} />, label: 'Hilfe & Support' },
  ];

  return (
    <div className="profile-page fade-in">
      <header className="app-header">
        <h1 className="app-title">Trainer<span>PRO</span></h1>
      </header>

      <div style={{ padding: '0 16px' }}>
        <div className="portfolio-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '40px',
            background: 'var(--pk-yellow)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid var(--pk-blue)',
            boxShadow: '0 0 20px var(--accent-glow)'
          }}>
            <User size={40} color="var(--pk-blue)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>Pokémon Trainer</h2>
          <div className="text-secondary" style={{ fontSize: '14px', marginBottom: '20px' }}>Level {Math.floor(stats.itemCount / 10) + 1} • {stats.itemCount} Karten</div>

          <div className="grid-2">
            <div className="stat-box" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="stat-label">Sammler Rang</div>
                <div className="stat-value" style={{ color: 'var(--pk-yellow)' }}>Pro</div>
            </div>
            <div className="stat-box" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="stat-label">Achievements</div>
                <div className="stat-value" style={{ color: 'var(--pk-red)' }}>12</div>
            </div>
          </div>
        </div>

        <div className="product-list" style={{ marginBottom: '40px' }}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="product-item"
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'var(--bg-secondary)' }}
            >
              <div className="product-image" style={{ width: '40px', height: '40px', background: 'var(--bg-tertiary)' }}>
                {item.icon}
              </div>
              <div className="product-info">
                <div className="product-name" style={{ fontSize: '15px' }}>{item.label}</div>
              </div>
              <ChevronRightIcon size={16} className="text-secondary" />
            </button>
          ))}

          <button
            className="product-item"
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'rgba(218, 54, 51, 0.1)', borderColor: 'var(--danger)' }}
          >
            <div className="product-image" style={{ width: '40px', height: '40px', background: 'var(--danger)', color: 'white' }}>
              <LogOut size={20} />
            </div>
            <div className="product-info">
              <div className="product-name" style={{ fontSize: '15px', color: 'var(--danger)' }}>Abmelden</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m9 18 6-6-6-6"/>
        </svg>
    );
}
