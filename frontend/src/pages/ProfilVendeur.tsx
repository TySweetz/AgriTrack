import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, ShoppingCart } from 'lucide-react';
import { authApi } from '../api/auth';
import { productsApi, Product } from '../api/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from '../constants/product';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ProfilVendeur = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { add } = useCart();
  const { addToast } = useToast();

  const [vendeur, setVendeur] = useState<{ id: string; nom: string; telephone?: string; adresse?: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!id) return;
    Promise.all([
      authApi.getPublicVendeur(id),
      productsApi.getAll().then((r) => ({ data: r.data.filter((p) => p.vendeurId === id) })),
    ]).then(([vendeurRes, productsRes]) => {
      setVendeur(vendeurRes.data);
      setProducts(productsRes.data);
      setLoading(false);
    }).catch(() => navigate('/marketplace'));
  }, [id]);

  const handleAdd = (product: Product) => {
    add(product, qtyMap[product.id] ?? 1);
    addToast(`${product.nom} ajouté au panier 🛒`, 'success');
  };

  const photoUrl = (p: Product) =>
    p.photo ? (p.photo.startsWith('http') ? p.photo : `${API_URL}${p.photo}`) : null;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
      </div>
    );
  }

  if (!vendeur) return null;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      {/* Carte vendeur */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center text-3xl font-bold text-sage-700 shrink-0">
            {vendeur.nom.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{vendeur.nom}</h1>
            <p className="text-sm text-sage-600 font-medium mt-0.5">🌱 Agriculteur</p>
          </div>
        </div>

        {(vendeur.telephone || vendeur.adresse) && (
          <div className="mt-4 space-y-1.5">
            {vendeur.telephone && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Phone size={14} className="text-gray-400" /> {vendeur.telephone}
              </p>
            )}
            {vendeur.adresse && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" /> {vendeur.adresse}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Ses produits */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Produits disponibles ({products.length})
      </h2>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">🌿</div>
          <p>Aucun produit disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
              {photoUrl(product) ? (
                <img src={photoUrl(product)!} alt={product.nom} className="h-40 w-full object-cover" />
              ) : (
                <div className="h-40 bg-sage-50 flex items-center justify-center text-4xl">
                  {CATEGORIES.find((c) => c.value === product.categorie)?.emoji ?? '🌿'}
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{product.nom}</h3>
                  <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full shrink-0">{product.categorie}</span>
                </div>
                {product.label && product.label !== 'Conventionnel' && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full w-fit mb-2">{product.label}</span>
                )}
                {product.description && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                )}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sage-700">
                      {Number(product.prix).toFixed(2)} €
                      <span className="text-xs font-normal text-gray-500"> / {product.unite}</span>
                    </span>
                    <span className={`text-xs ${Number(product.stock) > 0 ? 'text-gray-400' : 'text-red-400'}`}>
                      {Number(product.stock) > 0 ? `${product.stock} ${product.unite}` : 'Rupture'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                      <button
                        onClick={() => setQtyMap((m) => ({ ...m, [product.id]: Math.max(1, (m[product.id] ?? 1) - 1) }))}
                        className="w-8 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-sage-700 transition-colors font-semibold text-base"
                      >−</button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-800 select-none">
                        {qtyMap[product.id] ?? 1}
                      </span>
                      <button
                        onClick={() => setQtyMap((m) => ({ ...m, [product.id]: Math.min(Number(product.stock), (m[product.id] ?? 1) + 1) }))}
                        disabled={Number(product.stock) <= 0}
                        className="w-8 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-sage-700 transition-colors font-semibold text-base disabled:opacity-30"
                      >+</button>
                    </div>
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={Number(product.stock) <= 0}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <ShoppingCart size={14} />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
