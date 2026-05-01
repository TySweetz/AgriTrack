import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { dashboardApi, DashboardData } from '../api/dashboard';
import { Package, Truck, Users } from 'lucide-react';

/**
 * Page Dashboard - Affiche les métriques clés et les récentes livraisons
 */
export const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await dashboardApi.getAll();
        setData(dashboardData);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card className="bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="pb-24 md:pb-0">
      <div className="p-4 max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble de votre production</p>
        </div>

        {/* Cartes métriques - 4 colonnes sur desktop, 2 sur mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {/* Stock disponible */}
          <Card className="flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-gray-600 text-sm mb-1">Stock dispo</p>
            <p className="text-2xl md:text-3xl font-bold text-sage-700">
              {Number(data.total_stock_kg).toFixed(1)} kg
            </p>
          </Card>

          {/* Total vendu */}
          <Card className="flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-2">🚚</div>
            <p className="text-gray-600 text-sm mb-1">Total vendu</p>
            <p className="text-2xl md:text-3xl font-bold text-sage-700">
              {Number(data.total_vendu_kg).toFixed(1)} kg
            </p>
          </Card>

          {/* Nombre de livraisons */}
          <Card className="flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600 text-sm mb-1">Livraisons</p>
            <p className="text-2xl md:text-3xl font-bold text-sage-700">
              {data.nombre_livraisons}
            </p>
          </Card>

          {/* Moyenne par botte */}
          <Card className="flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-2">⚖️</div>
            <p className="text-gray-600 text-sm mb-1">Moy. botte</p>
            <p className="text-2xl md:text-3xl font-bold text-sage-700">
              {Number(data.moyenne_kg_botte).toFixed(1)} kg
            </p>
          </Card>
        </div>

        {/* Tableau des récentes livraisons */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">5 dernières livraisons</h2>

          {data.livraisons_recentes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune livraison enregistrée</p>
              <Button onClick={() => navigate('/livraisons')} size="md">
                Ajouter une livraison
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Lieu</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Client</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">Quantité (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.livraisons_recentes.map((delivery) => (
                    <tr key={delivery.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {new Date(delivery.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">{delivery.lieu}</td>
                      <td className="px-4 py-3">{delivery.client?.nom ?? 'Client inconnu'}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {Number(delivery.quantite_kg).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Boutons de navigation rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Button
            onClick={() => navigate('/inventaire')}
            className="flex items-center justify-center gap-2"
            size="lg"
          >
            <Package size={24} /> Gérer Inventaire
          </Button>
          <Button
            onClick={() => navigate('/livraisons')}
            className="flex items-center justify-center gap-2"
            size="lg"
          >
            <Truck size={24} /> Gérer Livraisons
          </Button>
          <Button
            onClick={() => navigate('/clients')}
            className="flex items-center justify-center gap-2"
            size="lg"
          >
            <Users size={24} /> Gérer Clients
          </Button>
        </div>
      </div>
    </div>
  );
};

// Les icônes nécessaires sont importées en haut du fichier.
