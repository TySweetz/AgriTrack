import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { companySettingsApi, CompanySettings } from '../api/companySettings';
import { useAuth } from '../context/AuthContext';

/**
 * Page de gestion des parametres entreprise : facturation (SIRET, TVA) et signature
 */
export const ParametresEntreprise = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [siret, setSiret] = useState('');
  const [assujettiTva, setAssujettiTva] = useState(false);
  const [tauxTva, setTauxTva] = useState('20');
  const [showOnDelivery, setShowOnDelivery] = useState(true);
  const [showOnInvoice, setShowOnInvoice] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, [user?.id]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await companySettingsApi.get();
      setSettings(data);
      setSiret(data.siret || '');
      setAssujettiTva(data.assujetti_tva);
      setTauxTva(String(data.taux_tva));
      setShowOnDelivery(data.signature_enabled_delivery);
      setShowOnInvoice(data.signature_enabled_invoice);
      setError(null);
    } catch {
      setError('Impossible de charger les parametres entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await companySettingsApi.update({
        siret: siret || undefined,
        assujetti_tva: assujettiTva,
        taux_tva: Number(tauxTva) || 0,
        signature_enabled_delivery: showOnDelivery,
        signature_enabled_invoice: showOnInvoice,
      });
      setSettings(updated);
      setSuccess('Parametres enregistres');
      setError(null);
    } catch {
      setError('Impossible d\'enregistrer les parametres');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        setError('Format non supporte. Utiliser PNG ou JPEG.');
        return;
      }

      const updated = await companySettingsApi.uploadSignature(file);
      setSettings(updated);
      setSuccess('Signature importee avec succes');
      setError(null);
    } catch {
      setError('Echec de l\'upload de la signature');
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Supprimer la signature actuelle ?')) {
      return;
    }

    try {
      const updated = await companySettingsApi.removeSignature();
      setSettings(updated);
      setSuccess('Signature supprimee');
      setError(null);
    } catch {
      setError('Echec de suppression de la signature');
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto pb-24 md:pb-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Parametres entreprise</h1>
        <p className="text-gray-600">Informations de facturation et signature affichee sur vos documents</p>
      </div>

      {error && (
        <Card className="mb-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}
      {success && (
        <Card className="mb-4 bg-green-50 border-green-200">
          <p className="text-green-700">{success}</p>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Facturation</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SIRET <span className="text-gray-400">(optionnel, affiché sur vos factures)</span>
            </label>
            <input
              type="text"
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              placeholder="123 456 789 00012"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={assujettiTva} onChange={(e) => setAssujettiTva(e.target.checked)} />
            Mon activité est assujettie à la TVA
          </label>

          {assujettiTva ? (
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">Taux de TVA (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tauxTva}
                onChange={(e) => setTauxTva(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              Vos factures afficheront la mention "TVA non applicable, article 293 B du CGI".
            </p>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700 pt-2 border-t border-gray-100">
            <input type="checkbox" checked={showOnDelivery} onChange={(e) => setShowOnDelivery(e.target.checked)} />
            Afficher la signature sur les bons de livraison
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={showOnInvoice} onChange={(e) => setShowOnInvoice(e.target.checked)} />
            Afficher la signature sur les factures
          </label>

          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Enregistrement...' : 'Enregistrer les parametres'}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Signature</h2>

        {settings?.signature_url ? (
          <div className="mb-4 border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Signature active</p>
            <img
              src={settings.signature_url}
              alt="Signature entreprise"
              className="max-h-28 object-contain bg-white border rounded p-2"
            />
            <p className="text-xs text-gray-500 mt-2">{settings.signature_file_name || 'signature'}</p>
          </div>
        ) : (
          <p className="text-gray-500 mb-4">Aucune signature importee</p>
        )}

        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center">
            <span className="sr-only">Uploader une signature</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleUpload}
              className="block text-sm text-gray-700"
            />
          </label>

          {settings?.signature_url && (
            <Button variant="danger" onClick={handleRemove}>
              Supprimer la signature
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
