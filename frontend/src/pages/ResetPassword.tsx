import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/auth';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('Token manquant ou invalide.');
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sage-700">🌱 AgriTrack</h1>
          <p className="text-gray-500 mt-2">Nouveau mot de passe</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <p className="text-gray-700 font-medium">Mot de passe mis à jour !</p>
            <p className="text-sm text-gray-500">Redirection vers la connexion...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                placeholder="Minimum 6 caractères"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                placeholder="Retapez le mot de passe"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-sage-600 font-medium hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
