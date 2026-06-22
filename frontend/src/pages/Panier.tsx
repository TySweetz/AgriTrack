import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersApi } from '../api/orders';

export const Panier = () => {
  const { items, remove, updateQty, clear, total } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [adresse, setAdresse] = useState(user?.adresse || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Votre panier est vide</h2>
        <p className="text-gray-400 mb-6">Parcourez la marketplace pour ajouter des produits.</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="bg-sage-600 hover:bg-sage-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Voir les produits
        </button>
      </div>
    );
  }

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await ordersApi.create({
        items: items.map((i) => ({ productId: i.product.id, quantite: i.quantite })),
        adresseLivraison: adresse || undefined,
        message: message || undefined,
      });
      clear();
      addToast('Commande passée avec succès ! 🎉', 'success');
      navigate('/mes-commandes');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Erreur lors de la commande', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon panier</h1>

      <div className="space-y-3 mb-6">
        {items.map(({ product, quantite }) => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            {product.photo ? (
              <img src={product.photo} alt={product.nom} className="w-16 h-16 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-sage-50 flex items-center justify-center text-2xl shrink-0">🌿</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{product.nom}</p>
              <p className="text-sm text-gray-500">{Number(product.prix).toFixed(2)} € / {product.unite}</p>
              <p className="text-sm font-semibold text-sage-700 mt-1">
                {(Number(product.prix) * quantite).toFixed(2)} €
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateQty(product.id, quantite - 1)}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus size={12} />
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantite}</span>
              <button
                onClick={() => updateQty(product.id, quantite + 1)}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <Plus size={12} />
              </button>
              <button
                onClick={() => remove(product.id)}
                className="ml-1 w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {user && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Finaliser la commande</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse de livraison <span className="text-gray-400">(optionnel)</span>
              </label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="12 rue des Champs, 63000 Clermont-Ferrand"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message au vendeur <span className="text-gray-400">(optionnel)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Instructions particulières..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div className="bg-sage-50 border border-sage-200 text-sage-700 rounded-xl p-4 mb-4 text-sm">
          Connectez-vous ou créez un compte pour passer votre commande.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Total</span>
          <span className="text-xl font-bold text-sage-700">{total.toFixed(2)} €</span>
        </div>
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-sage-600 hover:bg-sage-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Envoi...' : user ? 'Passer la commande' : 'Se connecter pour commander'}
        </button>
      </div>
    </div>
  );
};
