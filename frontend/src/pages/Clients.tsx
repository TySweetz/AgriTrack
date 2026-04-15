import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { clientsApi, Client } from '../api/clients';
import { Trash2, Edit2, Phone, MapPin } from 'lucide-react';

/**
 * Page Clients - Gestion des clients acheteurs
 */
export const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    adresse: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAll();
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      setError('Le nom du client est requis');
      return;
    }

    try {
      if (editingId) {
        await clientsApi.update(editingId, formData);
        setSuccess('Client modifié avec succès');
      } else {
        await clientsApi.create(formData);
        setSuccess('Client ajouté avec succès');
      }

      setFormData({ nom: '', telephone: '', adresse: '' });
      setEditingId(null);
      setIsModalOpen(false);
      await fetchClients();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (client: Client) => {
    setFormData({
      nom: client.nom,
      telephone: client.telephone || '',
      adresse: client.adresse || '',
    });
    setEditingId(client.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await clientsApi.delete(id);
        setSuccess('Client supprimé avec succès');
        await fetchClients();
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nom: '', telephone: '', adresse: '' });
  };

  return (
    <div className="pb-24 md:pb-0">
      <div className="p-4 max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion Clients</h1>
          <p className="text-gray-600">Total: <strong>{clients.length}</strong> client(s)</p>
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
            ➕ Ajouter un client
          </Button>
        </div>

        {/* Modal */}
        <Modal
          title={editingId ? 'Modifier le client' : 'Ajouter un client'}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" /> Téléphone
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" /> Adresse
              </label>
              <textarea
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                rows={3}
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

        {/* Liste des clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-gray-500 col-span-full">Chargement...</p>
          ) : clients.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 mb-4">Aucun client enregistré</p>
            </div>
          ) : (
            clients.map((client) => (
              <Card key={client.id} className="flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{client.nom}</h3>

                {client.telephone && (
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Phone size={14} /> {client.telephone}
                  </p>
                )}

                {client.adresse && (
                  <p className="text-sm text-gray-600 mb-3 flex gap-2">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span>{client.adresse}</span>
                  </p>
                )}

                <div className="mt-auto flex gap-2 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleEdit(client)}
                    variant="secondary"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <Edit2 size={16} /> Modifier
                  </Button>
                  <Button
                    onClick={() => handleDelete(client.id)}
                    variant="danger"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} /> Supprimer
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
