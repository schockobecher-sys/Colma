import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Database, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <LayoutDashboard size={24} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/cards" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <Search size={24} />
        <span>Suche</span>
      </NavLink>
      <NavLink to="/collection" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <Database size={24} />
        <span>Sammlung</span>
      </NavLink>
      <NavLink to="/favorites" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <User size={24} />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}
