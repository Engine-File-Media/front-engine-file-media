import { Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

const HomePage = () => <main className="min-h-300">Home</main>;
const AboutPage = () => <main className="min-h-300">About</main>;
const VolumeIPage = () => <main className="min-h-300">Volume I</main>;
const LetterboxPage = () => <main className="min-h-300">Letterbox</main>;

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/volume-i" element={<VolumeIPage />} />
        <Route path="/letterbox" element={<LetterboxPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
