import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
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
import { Livraisons } from './pages/Livraisons';
import { BonLivraison } from './pages/BonLivraison';
import { Factures } from './pages/Factures';
import { FactureDetail } from './pages/FactureDetail';
import { ParametresEntreprise } from './pages/ParametresEntreprise';
import { MesProduits } from './pages/MesProduits';
import { CommandesRecues } from './pages/CommandesRecues';

// Pages acheteur
import { AccueilAcheteur } from './pages/AccueilAcheteur';
import { Marketplace } from './pages/Marketplace';
import { Panier } from './pages/Panier';
import { MesCommandes } from './pages/MesCommandes';
import { ProfilVendeur } from './pages/ProfilVendeur';

import './App.css';

function HomeRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
      </div>
    );
  }
  if (!user) return <Navigate to="/marketplace" replace />;
  return <AccueilAcheteur />;
}

function BuyerLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col flex-1 pb-20 md:pb-0 min-w-0">
        <main className="flex-1 p-4 md:p-6">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/vendeur/:id" element={<ProfilVendeur />} />
            <Route path="/panier" element={<Panier />} />
            <Route path="/mes-commandes" element={<ProtectedRoute><MesCommandes /></ProtectedRoute>} />
            <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BuyerFooter />
      </div>
    </div>
  );
}

function SellerLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col flex-1 pb-20 md:pb-0 min-w-0">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ProtectedRoute requiredRole="agriculteur"><Dashboard /></ProtectedRoute>} />
            <Route path="/livraisons" element={<ProtectedRoute requiredRole="agriculteur"><Livraisons /></ProtectedRoute>} />
            <Route path="/livraisons/:id" element={<ProtectedRoute requiredRole="agriculteur"><BonLivraison /></ProtectedRoute>} />
            <Route path="/factures" element={<ProtectedRoute requiredRole="agriculteur"><Factures /></ProtectedRoute>} />
            <Route path="/factures/:id" element={<ProtectedRoute requiredRole="agriculteur"><FactureDetail /></ProtectedRoute>} />
            <Route path="/parametres" element={<ProtectedRoute requiredRole="agriculteur"><ParametresEntreprise /></ProtectedRoute>} />
            <Route path="/mes-produits" element={<ProtectedRoute requiredRole="agriculteur"><MesProduits /></ProtectedRoute>} />
            <Route path="/commandes-recues" element={<ProtectedRoute requiredRole="agriculteur"><CommandesRecues /></ProtectedRoute>} />
            <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BuyerFooter />
      </div>
    </div>
  );
}

function AppLayout() {
  const { user } = useAuth();
  return !user || user.role === 'acheteur' ? <BuyerLayout /> : <SellerLayout />;
}

function CartProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <CartProvider userId={user?.id}>{children}</CartProvider>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProviderWithAuth>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </ToastProvider>
        </CartProviderWithAuth>
      </AuthProvider>
    </Router>
  );
}

export default App;
