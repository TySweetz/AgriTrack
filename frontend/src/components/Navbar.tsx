import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { BarChart3, FileText, Package, Settings, Truck, Users } from 'lucide-react';

/**
 * Composant Navbar - Navigation bottom bar responsive (mobile-first)
 */
export const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/inventaire', icon: Package, label: 'Inventaire' },
    { path: '/livraisons', icon: Truck, label: 'Livraisons' },
    { path: '/factures', icon: FileText, label: 'Factures' },
    { path: '/clients', icon: Users, label: 'Clients' },
    { path: '/parametres', icon: Settings, label: 'Parametres' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:relative md:border-r md:w-64 md:h-screen md:flex md:flex-col">
      <div className="flex md:flex-col h-20 md:h-auto md:p-6">
        {/* Logo pour desktop */}
        <div className="hidden md:block mb-8">
          <h1 className="text-2xl font-bold text-sage-700">🌱 AgriTrack</h1>
        </div>

        {/* Navigation items */}
        <div className="flex flex-row md:flex-col gap-0 flex-1 md:gap-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors rounded-lg ${
                isActive(path)
                  ? 'bg-sage-100 text-sage-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
