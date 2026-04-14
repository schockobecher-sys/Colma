import { NavLink } from 'react-router-dom';
import { Home, Search, Library, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="nav-bar">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <div className="nav-icon-box">
              <Home size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>Home</span>
          </>
        )}
      </NavLink>
      <NavLink to="/cards" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <div className="nav-icon-box">
              <Search size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>Suche</span>
          </>
        )}
      </NavLink>
      <NavLink to="/collection" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <div className="nav-icon-box">
              <Library size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>Sammlung</span>
          </>
        )}
      </NavLink>
      <NavLink to="/favorites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <div className="nav-icon-box">
              <User size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>Profil</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
