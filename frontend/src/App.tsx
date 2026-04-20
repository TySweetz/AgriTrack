import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Inventaire } from './pages/Inventaire';
import { Livraisons } from './pages/Livraisons';
import { Clients } from './pages/Clients';
import { BonLivraison } from './pages/BonLivraison';
import { Factures } from './pages/Factures';
import { FactureDetail } from './pages/FactureDetail';
import { StockSoir } from './pages/StockSoir';
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventaire" element={<Inventaire />} />
            <Route path="/livraisons" element={<Livraisons />} />
            <Route path="/livraisons/:id" element={<BonLivraison />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/stock-soir" element={<StockSoir />} />
            <Route path="/factures" element={<Factures />} />
            <Route path="/factures/:id" element={<FactureDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
