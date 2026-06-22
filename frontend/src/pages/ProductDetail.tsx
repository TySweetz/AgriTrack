import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { productsApi, Product } from '../api/products';
import { reviewsApi, Review } from '../api/reviews';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from '../constants/product';
import { getPhotoUrl } from '../utils/media';
import { Stars } from '../components/Stars';

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
        <Star size={24} className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      </button>
    ))}
  </div>
);

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [noteForm, setNoteForm] = useState(0);
  const [commentForm, setCommentForm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!id) return;
    Promise.all([
      productsApi.getOne(id),
      reviewsApi.getByProduct(id),
      user?.role === 'acheteur' ? reviewsApi.getMine(id) : Promise.resolve({ data: null }),
    ])
      .then(([pRes, rRes, mineRes]) => {
        setProduct(pRes.data);
        setReviews(rRes.data.reviews);
        setAverage(rRes.data.average);
        setCount(rRes.data.count);
        if (mineRes.data) {
          setMyReview(mineRes.data);
          setNoteForm(mineRes.data.note);
          setCommentForm(mineRes.data.commentaire || '');
        }
        setLoading(false);
      })
      .catch(() => navigate('/marketplace'));
  };

  useEffect(() => { load(); }, [id, user?.id]);

  if (loading || !product) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
      </div>
    );
  }

  const photoUrl = getPhotoUrl(product.photo);
  const inStock = Number(product.stock) > 0;
  const isOwner = user?.id === product.vendeurId;

  const handleAdd = () => {
    add(product, qty);
    addToast(`${product.nom} ajouté au panier 🛒`, 'success');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noteForm < 1) { addToast('Choisissez une note', 'error'); return; }
    setSubmitting(true);
    try {
      await reviewsApi.upsert({ productId: product.id, note: noteForm, commentaire: commentForm || undefined });
      addToast(myReview ? 'Avis modifié' : 'Avis publié', 'success');
      load();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Erreur lors de la publication de l\'avis', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview || !window.confirm('Supprimer votre avis ?')) return;
    try {
      await reviewsApi.remove(myReview.id);
      setMyReview(null);
      setNoteForm(0);
      setCommentForm('');
      addToast('Avis supprimé', 'success');
      load();
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {photoUrl ? (
          <img src={photoUrl} alt={product.nom} className="w-full h-72 md:h-96 object-cover rounded-xl bg-gray-100" />
        ) : (
          <div className="w-full h-72 md:h-96 rounded-xl bg-sage-50 flex items-center justify-center text-7xl">
            {CATEGORIES.find((c) => c.value === product.categorie)?.emoji ?? '🌿'}
          </div>
        )}

        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{product.nom}</h1>
            <span className="text-xs bg-sage-100 text-sage-700 px-2.5 py-1 rounded-full shrink-0">{product.categorie}</span>
          </div>

          {product.label && product.label !== 'Conventionnel' && (
            <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full w-fit mb-2">{product.label}</span>
          )}

          {count > 0 ? (
            <a href="#avis" className="flex items-center gap-2 mb-4 hover:opacity-80">
              <Stars value={average} />
              <span className="text-sm text-gray-500">{average.toFixed(1)} ({count} avis)</span>
            </a>
          ) : (
            <p className="text-sm text-gray-400 mb-4">Aucun avis pour l'instant</p>
          )}

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-sage-700">
              {Number(product.prix).toFixed(2)} €<span className="text-sm font-normal text-gray-400"> / {product.unite}</span>
            </span>
            <span className={`text-sm ${inStock ? 'text-gray-500' : 'text-red-500 font-medium'}`}>
              {inStock ? `${product.stock} ${product.unite} en stock` : 'Rupture de stock'}
            </span>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">{product.description}</p>
          )}

          {isOwner ? (
            <div className="mt-auto bg-sage-50 border border-sage-200 rounded-xl p-4">
              <p className="text-sm text-sage-700 mb-3">
                C'est un de vos produits — ceci est un aperçu de sa page tel que les acheteurs la voient.
                {!inStock && ' Il reste visible et listé même en rupture ; vous pourrez le réapprovisionner quand vous le souhaitez.'}
              </p>
              <button
                onClick={() => navigate(`/mes-produits?edit=${product.id}`)}
                className="bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                Modifier ce produit
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-sage-700 font-semibold text-lg"
                  >−</button>
                  <span className="w-10 text-center text-sm font-semibold text-gray-800 select-none">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(Number(product.stock), q + 1))}
                    disabled={!inStock}
                    className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-sage-700 font-semibold text-lg disabled:opacity-30"
                  >+</button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!inStock}
                  className="flex-1 flex items-center justify-center gap-2 bg-sage-600 hover:bg-sage-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
                >
                  <ShoppingCart size={16} /> Ajouter au panier
                </button>
              </div>

              <Link
                to={`/vendeur/${product.vendeurId}`}
                className="mt-auto flex items-center gap-3 border border-gray-200 rounded-xl p-4 hover:border-sage-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center font-bold text-sage-700 shrink-0">
                  {(product.vendeur.entreprise || product.vendeur.nom).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">🌱 {product.vendeur.entreprise || product.vendeur.nom}</p>
                  {product.vendeur.telephone && (
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={11} /> {product.vendeur.telephone}</p>
                  )}
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Avis */}
      <div id="avis" className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Avis {count > 0 && `(${count})`}
        </h2>

        {user?.role === 'acheteur' && (
          <form onSubmit={handleSubmitReview} className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {myReview ? 'Modifier mon avis' : 'Laisser un avis'}
            </p>
            <StarPicker value={noteForm} onChange={setNoteForm} />
            <textarea
              value={commentForm}
              onChange={(e) => setCommentForm(e.target.value)}
              rows={2}
              placeholder="Votre avis sur ce produit (optionnel)..."
              className="w-full mt-3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
            />
            <div className="flex items-center gap-2 mt-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {submitting ? 'Envoi...' : myReview ? 'Mettre à jour' : 'Publier'}
              </button>
              {myReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Réservé aux acheteurs ayant reçu une commande contenant ce produit.
            </p>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">Soyez le premier à laisser un avis sur ce produit.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{r.acheteurNom}</p>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <Stars value={r.note} size={14} />
                {r.commentaire && <p className="text-sm text-gray-600 mt-1.5">{r.commentaire}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
