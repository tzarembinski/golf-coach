import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SwingProvider } from './context/SwingContext';
import Navigation from './components/Navigation';
import UploadPage from './pages/UploadPage';
import HistoryPage from './pages/HistoryPage';
import AnalysisDetailPage from './pages/AnalysisDetailPage';
import ComparisonPage from './pages/ComparisonPage';

// Log app initialization
console.log('%c========================================', 'color: #8b5cf6; font-weight: bold');
console.log('%cGOLF SWING ANALYZER - APP INITIALIZED', 'color: #8b5cf6; font-weight: bold');
console.log('%c========================================', 'color: #8b5cf6; font-weight: bold');
console.log('%cTimestamp:', 'color: #8b5cf6', new Date().toISOString());
console.log('%cUser Agent:', 'color: #8b5cf6', navigator.userAgent);
console.log('%cPlatform:', 'color: #8b5cf6', navigator.platform);
console.log('%cWindow location:', 'color: #8b5cf6', window.location.href);
console.log('%c========================================', 'color: #8b5cf6; font-weight: bold');

function App() {
  return (
    <SwingProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/analysis/:id" element={<AnalysisDetailPage />} />
            <Route path="/compare/:id1/:id2" element={<ComparisonPage />} />
          </Routes>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1f2937',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#16a34a',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc2626',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </SwingProvider>
  );
}

export default App;
