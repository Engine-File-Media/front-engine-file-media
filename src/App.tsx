import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FooterGeneral from './components/layout/FooterGeneral';
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import Volume1Page from './components/pages/Volume1Page';
import PurchasePage from './components/pages/PurchasePage';
import JournalPage from './components/pages/JournalPage';
import NotFoundPage from './components/pages/NotFoundPage';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/volume-i" element={<Volume1Page />} />
        <Route path="/purchase" element={<PurchasePage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {isHome ? <Footer /> : <FooterGeneral />}
    </div>
  );
}

export default App;
