import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { inventoryApi, Inventory } from '../api/inventory';
import { Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Page Inventaire - Gestion des stocks d'asperges
 */
export const Inventaire = () => {
  const navigate = useNavigate();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre_bottes: '',
    poids_moyen_botte: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAll();
      setInventories(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        nombre_bottes: parseInt(formData.nombre_bottes),
        poids_moyen_botte: formData.poids_moyen_botte
          ? parseFloat(formData.poids_moyen_botte)
          : undefined,
        date: new Date(formData.date).toISOString(),
      };

      if (editingId) {
        await inventoryApi.update(editingId, data);
        setSuccess('Stock modifié avec succès');
      } else {
        await inventoryApi.create(data);
        setSuccess('Stock ajouté avec succès');
      }

      setFormData({ nombre_bottes: '', poids_moyen_botte: '', date: new Date().toISOString().split('T')[0] });
      setEditingId(null);
      setIsModalOpen(false);
      await fetchInventories();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (inventory: Inventory) => {
    setFormData({
      nombre_bottes: Number(inventory.nombre_bottes ?? inventory.nombre_paniers ?? 0).toString(),
      poids_moyen_botte: Number(inventory.poids_moyen_botte ?? inventory.poids_moyen_panier ?? 0).toString(),
      date: new Date(inventory.date).toISOString().split('T')[0],
    });
    setEditingId(inventory.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) {
      try {
        await inventoryApi.delete(id);
        setSuccess('Stock supprimé avec succès');
        await fetchInventories();
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nombre_bottes: '', poids_moyen_botte: '', date: new Date().toISOString().split('T')[0] });
  };

  const totalStock = inventories.reduce(
    (sum: number, inv: Inventory) => sum + Number(inv.stock_total_kg),
    0,
  );
  const calculatedTotal =
    formData.nombre_bottes && formData.poids_moyen_botte
      ? (
          parseInt(formData.nombre_bottes) *
          parseFloat(formData.poids_moyen_botte)
        ).toFixed(1)
      : '0';

  return (
    <div className="pb-24 md:pb-0">
      <div className="p-4 max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion Inventaire</h1>
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
            <p className="text-sm text-sage-700">
              <strong>Stock total : {totalStock.toFixed(1)} kg</strong>
            </p>
          </div>
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
            ➕ Ajouter un stock
          </Button>
          <Button
            onClick={() => navigate('/stock-soir')}
            size="lg"
            variant="secondary"
            className="w-full md:w-auto mt-3 md:mt-0 md:ml-3"
          >
            Saisie stock du soir
          </Button>
        </div>

        {/* Modal */}
        <Modal
          title={editingId ? 'Modifier le stock' : 'Ajouter un stock'}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de saisie
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de bottes
              </label>
              <input
                type="number"
                min="0"
                value={formData.nombre_bottes}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_bottes: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids moyen par botte (kg) - Défaut 5 kg
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.poids_moyen_botte}
                onChange={(e) =>
                  setFormData({ ...formData, poids_moyen_botte: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            {/* Calcul en direct */}
            <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
              <p className="text-sm text-sage-700">
                <strong>Stock total calculé : {calculatedTotal} kg</strong>
              </p>
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

        {/* Liste des stocks */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Stocks enregistrés</h2>

          {loading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : inventories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun stock enregistré</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Bottes</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Poids moyen</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">Total kg</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventories.map((inventory) => (
                    <tr key={inventory.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {new Date(inventory.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">{inventory.nombre_bottes ?? inventory.nombre_paniers}</td>
                      <td className="px-4 py-3">{inventory.poids_moyen_botte ?? inventory.poids_moyen_panier} kg</td>
                      <td className="px-4 py-3 text-right font-semibold text-sage-700">
                        {Number(inventory.stock_total_kg).toFixed(1)} kg
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(inventory)}
                          className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center gap-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(inventory.id)}
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
