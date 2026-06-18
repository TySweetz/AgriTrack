import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const BuyerHeader = () => {
  const { count } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);
  const displayName = user?.pseudo || user?.nom || '';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/marketplace" className="text-xl font-bold text-sage-700 shrink-0">
          🌱 AgriTrack
        </Link>

        {/* Nav centrale */}
        <nav className="hidden md:flex items-center gap-1">
<<<<<<< Updated upstream
          <Link
            to="/marketplace"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/marketplace') ? 'bg-sage-100 text-sage-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Marketplace
          </Link>
          <Link
            to="/mes-commandes"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/mes-commandes') ? 'bg-sage-100 text-sage-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Mes commandes
          </Link>
=======
          {[
            { to: '/', label: 'Accueil', exact: true },
            { to: '/marketplace', label: 'Marketplace' },
            { to: '/mes-commandes', label: 'Mes commandes' },
          ].map(({ to, label, exact }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                exact ? location.pathname === to : isActive(to)
                  ? 'bg-sage-100 text-sage-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
>>>>>>> Stashed changes
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-2">
          <Link
            to="/panier"
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/panier') ? 'bg-sage-100 text-sage-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Panier</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          <Link
            to="/profil"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/profil') ? 'bg-sage-100 text-sage-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-sage-200 flex items-center justify-center text-xs font-bold text-sage-800">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline truncate max-w-[100px]">{displayName}</span>
          </Link>
        </div>
      </div>

      {/* Nav mobile bas */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40">
        {[
          { to: '/marketplace', icon: <span className="text-lg">🛍️</span>, label: 'Marketplace' },
          { to: '/panier', icon: <ShoppingCart size={20} />, label: 'Panier', badge: count },
          { to: '/mes-commandes', icon: <ClipboardList size={20} />, label: 'Commandes' },
          { to: '/profil', icon: <User size={20} />, label: 'Profil' },
        ].map(({ to, icon, label, badge }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium relative ${
              location.pathname.startsWith(to) ? 'text-sage-700' : 'text-gray-500'
            }`}
          >
            <span className="relative">
              {icon}
              {badge ? (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {badge}
                </span>
              ) : null}
            </span>
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
};
