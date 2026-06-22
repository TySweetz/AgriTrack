import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productsApi, Product } from '../api/products';
import { ordersApi, Order } from '../api/orders';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from '../constants/product';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const statutLabel: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  acceptee: { label: 'Acceptée', color: 'bg-green-100 text-green-700' },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
  livree: { label: 'Livrée', color: 'bg-blue-100 text-blue-700' },
};

export const AccueilAcheteur = () => {
  const { user } = useAuth();
  const { add } = useCart();
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const displayName = user?.pseudo || user?.nom || '';

  useEffect(() => {
    setProducts([]);
    setOrders([]);
    setLoading(true);
    Promise.all([
      productsApi.getAll(),
      ordersApi.getMine(),
    ]).then(([pRes, oRes]) => {
      setProducts(pRes.data.slice(0, 6));
      setOrders(oRes.data.slice(0, 3));
      setLoading(false);
    });
  }, [user?.id]);

  const photoUrl = (p: Product) =>
    p.photo ? (p.photo.startsWith('http') ? p.photo : `${API_URL}${p.photo}`) : null;

  return (
    <div className="space-y-8">
      {/* Bannière bienvenue */}
      <div className="bg-sage-700 rounded-2xl p-6 text-white">
        <p className="text-sage-200 text-sm mb-1">Bonjour,</p>
        <h1 className="text-2xl font-bold mb-3">{displayName} 👋</h1>
        <p className="text-sage-100 text-sm mb-4">Découvrez les produits frais de nos agriculteurs locaux.</p>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 bg-white text-sage-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-sage-50 transition-colors"
        >
          Explorer la marketplace <ArrowRight size={16} />
        </Link>
      </div>

      {/* Dernières commandes */}
      {orders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Mes dernières commandes</h2>
            <Link to="/mes-commandes" className="text-sm text-sage-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {orders.map((order) => {
              const st = statutLabel[order.statut];
              return (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.items.map((i) => i.nomProduit).join(', ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')} · {Number(order.total).toFixed(2)} €
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ml-3 ${st.color}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Produits récents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Produits récents</h2>
          <Link to="/marketplace" className="text-sm text-sage-600 hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-sage-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {photoUrl(product) ? (
                  <img src={photoUrl(product)!} alt={product.nom} className="h-28 w-full object-cover" />
                ) : (
                  <div className="h-28 bg-sage-50 flex items-center justify-center text-3xl">
                    {CATEGORIES.find((c) => c.value === product.categorie)?.emoji ?? '🌿'}
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.nom}</p>
                  <p className="text-xs text-gray-400 truncate">🌱 {product.vendeur.entreprise || product.vendeur.nom}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-sage-700">
                      {Number(product.prix).toFixed(2)} €<span className="text-xs font-normal text-gray-400">/{product.unite}</span>
                    </span>
                    <button
                      onClick={() => { add(product, 1); addToast(`${product.nom} ajouté 🛒`, 'success'); }}
                      disabled={Number(product.stock) <= 0}
                      className="w-8 h-8 bg-sage-600 hover:bg-sage-700 text-white rounded-lg flex items-center justify-center disabled:opacity-40 transition-colors"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
