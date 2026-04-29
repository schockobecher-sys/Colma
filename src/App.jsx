import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CollectionProvider } from './context/CollectionContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CardsPage from './pages/CardsPage';
import CollectionPage from './pages/CollectionPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <main className="main-content">
      <div key={location.pathname} className="page-transition">
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/favorites" element={<ProfilePage />} />
        </Routes>
      </div>
    </main>
  );
}

function App() {
  return (
    <CollectionProvider>
      <ToastProvider>
        <Router>
          <div className="app">
            <Navbar />
            <AnimatedRoutes />
          </div>
        </Router>
      </ToastProvider>
    </CollectionProvider>
  );
}

export default App;
