import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FooterGeneral from './components/layout/FooterGeneral';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import VolumeIPage from './components/Volume1Page';
import JournalPage from './components/JournalPage';
import NotFoundPage from './components/NotFoundPage';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/volume-i" element={<VolumeIPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {isHome ? <Footer /> : <FooterGeneral />}
    </div>
  );
}

export default App;
