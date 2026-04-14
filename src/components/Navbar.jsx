import { NavLink } from 'react-router-dom';
import { Home, Search, Library, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/cards" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <Search size={24} />
        <span>Suche</span>
      </NavLink>
      <NavLink to="/collection" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <Library size={24} />
        <span>Sammlung</span>
      </NavLink>
      <NavLink to="/favorites" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <User size={24} />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}
