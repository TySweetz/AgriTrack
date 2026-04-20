import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { inventorySnapshotsApi, InventorySnapshot } from '../api/inventory';

/**
 * Page Stock du soir - saisie rapide du stock restant
 */
export const StockSoir = () => {
  const [snapshots, setSnapshots] = useState<InventorySnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    stock_restant_kg: '',
    notes: '',
  });

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const fetchSnapshots = async () => {
    try {
      setLoading(true);
      const data = await inventorySnapshotsApi.getLatest(7);
      setSnapshots(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du stock du soir');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.stock_restant_kg) {
      setError('La date et le stock restant sont requis');
      return;
    }

    try {
      await inventorySnapshotsApi.create({
        date: new Date(formData.date).toISOString(),
        stock_restant_kg: parseFloat(formData.stock_restant_kg),
        notes: formData.notes || undefined,
      });

      setSuccess('Stock du soir enregistré avec succès');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        stock_restant_kg: '',
        notes: '',
      });
      await fetchSnapshots();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto pb-24 md:pb-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock du soir</h1>
        <p className="text-gray-600">Saisie rapide du stock restant en fin de journée</p>
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
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock restant (kg) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.stock_restant_kg}
              onChange={(e) => setFormData({ ...formData, stock_restant_kg: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: fin de récolte, lot séparé..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-3">
            <Button type="submit" size="lg" className="w-full md:w-auto">
              Enregistrer le stock du soir
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Historique récent</h2>

        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : snapshots.length === 0 ? (
          <p className="text-gray-500">Aucune saisie enregistrée</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Stock restant</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot) => (
                  <tr key={snapshot.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(snapshot.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right font-semibold text-sage-700">
                      {Number(snapshot.stock_restant_kg).toFixed(1)} kg
                    </td>
                    <td className="px-4 py-3">{snapshot.notes ?? '-'}</td>
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