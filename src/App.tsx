import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FooterGeneral from './components/layout/FooterGeneral';
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import Volume1Page from './components/pages/Volume1Page';
import PurchasePage from './components/pages/PurchasePage';
import PurchaseReturnPage from './components/pages/PurchaseReturnPage';
import PurchaseCancelPage from './components/pages/PurchaseCancelPage';
import JournalPage from './components/pages/JournalPage';
import NotFoundPage from './components/pages/NotFoundPage';

function App() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isPurchaseFlow = pathname.startsWith('/purchase');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar logoOnly={isPurchaseFlow} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/volume-i" element={<Volume1Page />} />
        <Route path="/purchase/:volumeId?" element={<PurchasePage />} />
        <Route path="/checkout/success" element={<PurchaseReturnPage />} />
        <Route path="/checkout/cancel" element={<PurchaseCancelPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!isPurchaseFlow && (isHome ? <Footer /> : <FooterGeneral />)}
    </div>
  );
}

export default App;
