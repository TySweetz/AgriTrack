import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  BarChart3, ClipboardList, FileText, Home, Package,
  Settings, ShoppingBag, ShoppingCart, Truck, Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/orders';

export const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { count } = useCart();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'agriculteur') return;

    ordersApi.getPendingCount().then((r) => setPendingCount(r.data.count)).catch(() => {});

    const interval = setInterval(() => {
      ordersApi.getPendingCount().then((r) => setPendingCount(r.data.count)).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.role]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const vendeurItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/mes-produits', icon: ShoppingBag, label: 'Mes produits' },
    { path: '/commandes-recues', icon: ClipboardList, label: 'Commandes', badge: pendingCount || null },
    { path: '/inventaire', icon: Package, label: 'Inventaire' },
    { path: '/livraisons', icon: Truck, label: 'Livraisons' },
    { path: '/factures', icon: FileText, label: 'Factures' },
    { path: '/clients', icon: Users, label: 'Clients' },
    { path: '/parametres', icon: Settings, label: 'Paramètres' },
  ];

  const acheteurItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { path: '/panier', icon: ShoppingCart, label: 'Panier', badge: count || null },
    { path: '/mes-commandes', icon: ClipboardList, label: 'Mes commandes' },
  ];

  const navItems = user?.role === 'acheteur' ? acheteurItems : vendeurItems;
  const displayName = user
    ? user.role === 'acheteur' && user.pseudo ? user.pseudo : user.nom
    : '';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:relative md:border-r md:w-64 md:min-h-screen md:flex md:flex-col">
      <div className="flex md:flex-col h-16 md:h-auto md:p-6 md:flex-1">
        {/* Logo desktop */}
        <div className="hidden md:block mb-6">
          <Link to="/" className="text-2xl font-bold text-sage-700">🌱 AgriTrack</Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-row md:flex-col gap-0 flex-1 md:gap-1 overflow-x-auto md:overflow-visible">
          {navItems.map(({ path, icon: Icon, label, badge }: any) => (
            <Link
              key={path}
              to={path}
              className={`flex-shrink-0 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors rounded-lg ${
                isActive(path) ? 'bg-sage-100 text-sage-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="relative">
                <Icon size={20} />
                {badge ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {badge}
                  </span>
                ) : null}
              </span>
              <span className="hidden md:inline">{label}</span>
              {badge ? (
                <span className="hidden md:inline ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>

        {/* Profil */}
        {user && (
          <div className="hidden md:block mt-auto pt-4 border-t border-gray-100">
            <Link
              to="/profil"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/profil') ? 'bg-sage-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center text-sm font-bold text-sage-800 shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
