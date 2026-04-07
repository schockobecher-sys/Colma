import { Link } from 'react-router-dom';
import { Home, BookOpen, Folder, Star } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <span className="logo">🎴</span>
          <h1>Colma</h1>
        </Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">
            <Home size={20} />
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link to="/cards">
            <BookOpen size={20} />
            <span>Cards</span>
          </Link>
        </li>
        <li>
          <Link to="/collection">
            <Folder size={20} />
            <span>Collection</span>
          </Link>
        </li>
        <li>
          <Link to="/favorites">
            <Star size={20} />
            <span>Favorites</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
