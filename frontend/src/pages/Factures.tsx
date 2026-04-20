import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { clientsApi, Client } from '../api/clients';
import { invoicesApi, Invoice } from '../api/invoices';
import { Printer, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Page Factures - génération mensuelle et consultation simple
 */
export const Factures = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const today = new Date();
  const [formData, setFormData] = useState({
    client_id: '',
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1).padStart(2, '0'),
    prix_unitaire_kg: '0',
    taux_tva: '20',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsData, invoicesData] = await Promise.all([
        clientsApi.getAll(),
        invoicesApi.getAll(),
      ]);
      setClients(clientsData);
      setInvoices(invoicesData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      setError('Le client est requis');
      return;
    }

    try {
      const year = Number(formData.year);
      const month = Number(formData.month);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      await invoicesApi.generateMonthly({
        client_id: formData.client_id,
        period_start: firstDay.toISOString(),
        period_end: lastDay.toISOString(),
        prix_unitaire_kg: parseFloat(formData.prix_unitaire_kg),
        taux_tva: parseFloat(formData.taux_tva),
      });

      setSuccess('Facture générée avec succès');
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setError('Erreur lors de la génération de la facture');
    }
  };

  const handlePrint = (id: string) => {
    window.open(`/factures/${id}`, '_blank');
  };

  return (
    <div className="p-4 max-w-6xl mx-auto pb-24 md:pb-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Factures</h1>
        <p className="text-gray-600">Gestion et génération mensuelle des factures</p>
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

      <div className="mb-6">
        <Button onClick={() => setIsModalOpen(true)} size="lg" className="w-full md:w-auto">
          ➕ Générer une facture
        </Button>
      </div>

      <Modal title="Générer une facture mensuelle" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="">-- Sélectionnez un client --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Année *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mois *</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix unitaire / kg *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.prix_unitaire_kg}
                onChange={(e) => setFormData({ ...formData, prix_unitaire_kg: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">TVA (%) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.taux_tva}
                onChange={(e) => setFormData({ ...formData, taux_tva: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" size="md" className="flex-1">Générer</Button>
            <Button type="button" variant="secondary" size="md" onClick={() => setIsModalOpen(false)} className="flex-1">Annuler</Button>
          </div>
        </form>
      </Modal>

      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Factures enregistrées</h2>

        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune facture enregistrée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Facture</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Client</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Période</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">TTC</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{invoice.numero_facture}</td>
                    <td className="px-4 py-3">{invoice.client?.nom ?? 'Client inconnu'}</td>
                    <td className="px-4 py-3">
                      {new Date(invoice.period_start).toLocaleDateString('fr-FR')} - {new Date(invoice.period_end).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-sage-700">
                      {Number(invoice.montant_ttc).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/factures/${invoice.id}`)}
                        className="text-sage-700 hover:text-sage-900 mr-3 inline-flex items-center gap-1"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => handlePrint(invoice.id)}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};