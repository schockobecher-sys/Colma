import { Link } from 'react-router-dom';
import { Search, TrendingUp, Folder } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Colma</h1>
          <p className="hero-subtitle">Your Ultimate Pokémon Card Collection Tracker</p>
          <p className="hero-description">
            Discover, track, and manage your Pokémon TCG collection with ease. 
            Browse our extensive database, add cards to your collection, and keep track of their value.
          </p>
          <div className="hero-actions">
            <Link to="/cards" className="btn btn-primary btn-large">
              <Search size={20} />
              Browse Cards
            </Link>
            <Link to="/collection" className="btn btn-secondary btn-large">
              <Folder size={20} />
              View Collection
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/src/assets/hero.png" alt="Pokémon Cards" />
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Search size={40} />
            </div>
            <h3>Extensive Database</h3>
            <p>Browse thousands of Pokémon cards from all sets with detailed information.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Folder size={40} />
            </div>
            <h3>Track Your Collection</h3>
            <p>Add cards to your personal collection and track quantities and conditions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <TrendingUp size={40} />
            </div>
            <h3>Market Prices</h3>
            <p>Stay updated with current market prices and track your collection's value.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Start Your Collection Today</h2>
        <p>Join thousands of collectors and begin tracking your Pokémon cards now!</p>
        <Link to="/cards" className="btn btn-primary btn-large">
          Get Started
        </Link>
      </section>
    </div>
  );
}
