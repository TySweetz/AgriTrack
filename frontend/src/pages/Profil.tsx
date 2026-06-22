import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, LogOut, ShoppingCart, Tractor, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type Modal = 'agriculteur' | 'acheteur' | null;

export const Profil = () => {
  const { user, switchRole, updateMe, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [agriForm, setAgriForm] = useState({ entreprise: '', telephone: '' });
  const [pseudoForm, setPseudoForm] = useState('');

  if (!user) return null;

  const isAgriculteur = user.role === 'agriculteur';
  const targetRole: 'agriculteur' | 'acheteur' = isAgriculteur ? 'acheteur' : 'agriculteur';

  const handleSwitchClick = () => {
    if (targetRole === 'agriculteur') {
      // Déjà des infos vendeur sauvegardées → switch direct
      if (user.telephone) {
        doSwitch('agriculteur');
      } else {
        setAgriForm({ entreprise: '', telephone: '' });
        setModal('agriculteur');
      }
    } else {
      // Déjà un pseudo sauvegardé → switch direct
      if (user.pseudo) {
        doSwitch('acheteur');
      } else {
        setPseudoForm('');
        setModal('acheteur');
      }
    }
  };

  const doSwitch = async (role: 'agriculteur' | 'acheteur') => {
    setLoading(true);
    try {
      await switchRole(role);
      addToast(
        role === 'agriculteur' ? 'Mode Agriculteur activé 🌱' : 'Mode Acheteur activé 🛒',
        'success',
      );
      navigate('/');
    } catch {
      addToast('Erreur lors du changement de rôle', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAgriSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setModal(null);
    setLoading(true);
    try {
      await updateMe({ entreprise: agriForm.entreprise, telephone: agriForm.telephone });
      await switchRole('agriculteur');
      addToast('Mode Agriculteur activé 🌱', 'success');
      navigate('/');
    } catch {
      addToast('Erreur lors du changement de rôle', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePseudoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setModal(null);
    setLoading(true);
    try {
      await updateMe({ pseudo: pseudoForm });
      await switchRole('acheteur');
      addToast('Mode Acheteur activé 🛒', 'success');
      navigate('/');
    } catch {
      addToast('Erreur lors du changement de rôle', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = isAgriculteur ? (user.entreprise || user.nom) : (user.pseudo || user.nom);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

      {/* Carte infos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center text-2xl font-bold text-sage-700">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{displayName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sage-50 w-fit">
          {isAgriculteur ? (
            <Tractor size={16} className="text-sage-700" />
          ) : (
            <ShoppingCart size={16} className="text-sage-700" />
          )}
          <span className="text-sm font-medium text-sage-700 capitalize">{user.role}</span>
        </div>

        {user.telephone && (
          <p className="text-sm text-gray-600 mt-3">📞 {user.telephone}</p>
        )}
        {user.adresse && (
          <p className="text-sm text-gray-600 mt-1">📍 {user.adresse}</p>
        )}
      </div>

      {/* Switch de rôle */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-1">Changer de mode</h2>
        <p className="text-sm text-gray-500 mb-4">
          {isAgriculteur
            ? 'Passez en mode Acheteur pour parcourir la marketplace et passer des commandes.'
            : 'Passez en mode Agriculteur pour lister vos produits et gérer vos ventes.'}
        </p>
        <button
          onClick={handleSwitchClick}
          disabled={loading}
          className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <ArrowLeftRight size={16} />
          {loading
            ? 'Changement...'
            : `Passer en mode ${targetRole === 'agriculteur' ? 'Agriculteur' : 'Acheteur'}`}
        </button>
      </div>

      {/* Déconnexion */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Session</h2>
        <p className="text-sm text-gray-500 mb-4">Déconnectez-vous de votre compte AgriTrack.</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 font-medium px-5 py-2.5 rounded-lg transition-colors border border-red-200"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>

      {/* Modale — passage en mode Agriculteur (première fois) */}
      {modal === 'agriculteur' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Profil vendeur</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Renseignez le nom de votre entreprise et votre téléphone (obligatoires). Ces informations ne vous
              seront plus demandées lors de vos prochains passages en mode Agriculteur.
            </p>
            <form onSubmit={handleAgriSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={agriForm.entreprise}
                  onChange={(e) => setAgriForm((f) => ({ ...f, entreprise: e.target.value }))}
                  required
                  placeholder="Ferme Dupont"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={agriForm.telephone}
                  onChange={(e) => setAgriForm((f) => ({ ...f, telephone: e.target.value }))}
                  required
                  placeholder="06 12 34 56 78"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sage-600 hover:bg-sage-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale — passage en mode Acheteur (première fois) */}
      {modal === 'acheteur' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Votre pseudo acheteur</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Choisissez le nom ou pseudo qui sera affiché lors de vos achats. Vous ne pourrez plus
              le modifier par la suite depuis cette interface.
            </p>
            <form onSubmit={handlePseudoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pseudo / Nom d'affichage <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={pseudoForm}
                  onChange={(e) => setPseudoForm(e.target.value)}
                  required
                  placeholder="Jean D. ou @jean_acheteur"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sage-600 hover:bg-sage-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
