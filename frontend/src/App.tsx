import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Inventaire } from './pages/Inventaire';
import { Livraisons } from './pages/Livraisons';
import { Clients } from './pages/Clients';
import { BonLivraison } from './pages/BonLivraison';
import { Factures } from './pages/Factures';
import { FactureDetail } from './pages/FactureDetail';
import { StockSoir } from './pages/StockSoir';
import { ParametresEntreprise } from './pages/ParametresEntreprise';
import { Profil } from './pages/Profil';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import './App.css';

function AppLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/inventaire" element={<ProtectedRoute><Inventaire /></ProtectedRoute>} />
          <Route path="/livraisons" element={<ProtectedRoute><Livraisons /></ProtectedRoute>} />
          <Route path="/livraisons/:id" element={<ProtectedRoute><BonLivraison /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/stock-soir" element={<ProtectedRoute><StockSoir /></ProtectedRoute>} />
          <Route path="/factures" element={<ProtectedRoute><Factures /></ProtectedRoute>} />
          <Route path="/factures/:id" element={<ProtectedRoute><FactureDetail /></ProtectedRoute>} />
          <Route path="/parametres" element={<ProtectedRoute><ParametresEntreprise /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
