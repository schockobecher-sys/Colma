import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CollectionProvider } from './context/CollectionContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import CardsPage from './pages/CardsPage';
import CollectionPage from './pages/CollectionPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <CollectionProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Toast />
          <main className="main-content page-transition">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cards" element={<CardsPage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/favorites" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CollectionProvider>
  );
}

export default App;
