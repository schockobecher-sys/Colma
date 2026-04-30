import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CollectionProvider } from './context/CollectionContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CardsPage from './pages/CardsPage';
import CollectionPage from './pages/CollectionPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <CollectionProvider>
      <ToastProvider>
        <Router>
          <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cards" element={<CardsPage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/favorites" element={<ProfilePage />} />
            </Routes>
          </main>
            </div>
          </Router>
      </ToastProvider>
    </CollectionProvider>
  );
}

export default App;
