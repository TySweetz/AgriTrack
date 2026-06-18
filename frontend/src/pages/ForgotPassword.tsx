import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Une erreur s'est produite. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sage-700">🌱 AgriTrack</h1>
          <p className="text-gray-500 mt-2">Réinitialiser mon mot de passe</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📬</div>
            <p className="text-gray-700 font-medium">Email envoyé !</p>
            <p className="text-sm text-gray-500">
              Si un compte existe avec cette adresse, vous recevrez un lien valable 1 heure.
            </p>
            <Link to="/login" className="text-sage-600 font-medium hover:underline text-sm">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <p className="text-sm text-gray-600">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                placeholder="vous@exemple.fr"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Envoyer le lien'}
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
