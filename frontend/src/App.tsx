import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { BuyerHeader } from './components/BuyerHeader';
import { BuyerFooter } from './components/BuyerFooter';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Pages communes
import { Profil } from './pages/Profil';

// Pages vendeur
import { Dashboard } from './pages/Dashboard';
import { Inventaire } from './pages/Inventaire';
import { Livraisons } from './pages/Livraisons';
import { Clients } from './pages/Clients';
import { BonLivraison } from './pages/BonLivraison';
import { Factures } from './pages/Factures';
import { FactureDetail } from './pages/FactureDetail';
import { StockSoir } from './pages/StockSoir';
import { ParametresEntreprise } from './pages/ParametresEntreprise';
import { MesProduits } from './pages/MesProduits';
import { CommandesRecues } from './pages/CommandesRecues';

// Pages acheteur
import { Marketplace } from './pages/Marketplace';
import { Panier } from './pages/Panier';
import { MesCommandes } from './pages/MesCommandes';

import './App.css';

function BuyerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <BuyerHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/panier" element={<ProtectedRoute><Panier /></ProtectedRoute>} />
          <Route path="/mes-commandes" element={<ProtectedRoute><MesCommandes /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/marketplace" replace />} />
        </Routes>
      </main>
      <BuyerFooter />
    </div>
  );
}

function SellerLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<ProtectedRoute requiredRole="agriculteur"><Dashboard /></ProtectedRoute>} />
          <Route path="/inventaire" element={<ProtectedRoute requiredRole="agriculteur"><Inventaire /></ProtectedRoute>} />
          <Route path="/livraisons" element={<ProtectedRoute requiredRole="agriculteur"><Livraisons /></ProtectedRoute>} />
          <Route path="/livraisons/:id" element={<ProtectedRoute requiredRole="agriculteur"><BonLivraison /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute requiredRole="agriculteur"><Clients /></ProtectedRoute>} />
          <Route path="/stock-soir" element={<ProtectedRoute requiredRole="agriculteur"><StockSoir /></ProtectedRoute>} />
          <Route path="/factures" element={<ProtectedRoute requiredRole="agriculteur"><Factures /></ProtectedRoute>} />
          <Route path="/factures/:id" element={<ProtectedRoute requiredRole="agriculteur"><FactureDetail /></ProtectedRoute>} />
          <Route path="/parametres" element={<ProtectedRoute requiredRole="agriculteur"><ParametresEntreprise /></ProtectedRoute>} />
          <Route path="/mes-produits" element={<ProtectedRoute requiredRole="agriculteur"><MesProduits /></ProtectedRoute>} />
          <Route path="/commandes-recues" element={<ProtectedRoute requiredRole="agriculteur"><CommandesRecues /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppLayout() {
  const { user } = useAuth();
  return user?.role === 'acheteur' ? <BuyerLayout /> : <SellerLayout />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
