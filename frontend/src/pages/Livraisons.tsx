import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { deliveriesApi, Delivery } from '../api/deliveries';
import { clientsApi, Client } from '../api/clients';
import { Trash2, Edit2 } from 'lucide-react';

/**
 * Page Livraisons - Gestion des livraisons d'asperges
 */
export const Livraisons = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    lieu: '',
    quantite_kg: '',
    client_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, clientsData] = await Promise.all([
        deliveriesApi.getAll(),
        clientsApi.getAll(),
      ]);
      setDeliveries(deliveriesData);
      setClients(clientsData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.lieu || !formData.quantite_kg || !formData.client_id) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      const data = {
        date: new Date(formData.date).toISOString(),
        lieu: formData.lieu,
        quantite_kg: parseFloat(formData.quantite_kg),
        client_id: formData.client_id,
      };

      if (editingId) {
        await deliveriesApi.update(editingId, data);
        setSuccess('Livraison modifiée avec succès');
      } else {
        await deliveriesApi.create(data);
        setSuccess('Livraison ajoutée avec succès');
      }

      setFormData({ date: '', lieu: '', quantite_kg: '', client_id: '' });
      setEditingId(null);
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (delivery: Delivery) => {
    const dateStr = new Date(delivery.date).toISOString().split('T')[0];
    setFormData({
      date: dateStr,
      lieu: delivery.lieu,
      quantite_kg: delivery.quantite_kg.toString(),
      client_id: delivery.client_id,
    });
    setEditingId(delivery.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette livraison ?')) {
      try {
        await deliveriesApi.delete(id);
        setSuccess('Livraison supprimée avec succès');
        await fetchData();
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', lieu: '', quantite_kg: '', client_id: '' });
  };

  return (
    <div className="pb-24 md:pb-0">
      <div className="p-4 max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion Livraisons</h1>
          <p className="text-gray-600">Total: <strong>{deliveries.length}</strong> livraison(s)</p>
        </div>

        {/* Messages */}
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

        {/* Bouton ajouter */}
        <div className="mb-6">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="w-full md:w-auto"
          >
            ➕ Ajouter une livraison
          </Button>
        </div>

        {/* Modal */}
        <Modal
          title={editingId ? 'Modifier la livraison' : 'Ajouter une livraison'}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu *
              </label>
              <input
                type="text"
                value={formData.lieu}
                onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                required
                placeholder="Ex: Marché de Paris"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.quantite_kg}
                onChange={(e) => setFormData({ ...formData, quantite_kg: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="md" className="flex-1">
                {editingId ? 'Mettre à jour' : 'Ajouter'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Modal>

        {/* Liste des livraisons */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Livraisons enregistrées</h2>

          {loading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune livraison enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Lieu</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Client</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">Quantité</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {new Date(delivery.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">{delivery.lieu}</td>
                      <td className="px-4 py-3">{delivery.client?.nom ?? 'Client inconnu'}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {Number(delivery.quantite_kg ?? 0).toFixed(1)} kg
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(delivery)}
                          className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center gap-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(delivery.id)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
};
