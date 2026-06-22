import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ClipboardList, Euro, Package } from 'lucide-react';
import { dashboardApi, DashboardData } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';

const statutLabel: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  acceptee: { label: 'Acceptée', color: 'bg-green-100 text-green-700' },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
  livree: { label: 'Livrée', color: 'bg-blue-100 text-blue-700' },
};

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => dashboardApi.getAll().then(setData).catch(() => {}).finally(() => setLoading(false));
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
      </div>
    );
  }

  if (!data) return null;

  const maxSale = Math.max(...data.salesByDay.map((d) => d.total), 1);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Cartes métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><Euro size={14} /> Revenu confirmé</div>
          <p className="text-xl md:text-2xl font-bold text-sage-700">{data.totalRevenue.toFixed(2)} €</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><ClipboardList size={14} /> Commandes confirmées</div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{data.ordersConfirmedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><ClipboardList size={14} /> En attente</div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{data.pendingOrdersCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><Package size={14} /> Produits actifs</div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{data.activeProductsCount}<span className="text-sm text-gray-400">/{data.totalProductsCount}</span></p>
        </div>
      </div>

      {/* Ventes 14 derniers jours */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Ventes des 14 derniers jours</h2>
        <div className="flex items-end gap-1 h-32">
          {data.salesByDay.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div
                className="w-full bg-sage-300 group-hover:bg-sage-500 rounded-t transition-colors"
                style={{ height: `${Math.max((d.total / maxSale) * 100, d.total > 0 ? 4 : 1)}%` }}
              />
              <span className="absolute -top-6 hidden group-hover:block text-xs bg-gray-900 text-white px-2 py-0.5 rounded whitespace-nowrap z-10">
                {d.total.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          <span>{new Date(data.salesByDay[0].date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
          <span>{new Date(data.salesByDay[data.salesByDay.length - 1].date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Top produits */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top produits vendus</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune vente confirmée pour l'instant.</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.nom + i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{p.nom}</p>
                    <p className="text-xs text-gray-400">{p.quantite} {p.unite} vendus</p>
                  </div>
                  <span className="font-semibold text-sage-700">{p.revenue.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock faible */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Stock faible
          </h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400">Tous vos produits actifs ont un stock suffisant.</p>
          ) : (
            <div className="space-y-2">
              {data.lowStockProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate('/mes-produits')}
                  className="w-full flex items-center justify-between text-sm bg-amber-50 hover:bg-amber-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <span className="text-gray-800">{p.nom}</span>
                  <span className="font-semibold text-amber-700">{p.stock} {p.unite} restant</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dernières commandes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Dernières commandes</h2>
          <button onClick={() => navigate('/commandes-recues')} className="text-xs text-sage-700 hover:underline">Tout voir</button>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Aucune commande reçue pour l'instant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b">
                <tr>
                  <th className="px-2 py-2 font-medium text-gray-500">Client</th>
                  <th className="px-2 py-2 font-medium text-gray-500">Articles</th>
                  <th className="px-2 py-2 font-medium text-gray-500">Statut</th>
                  <th className="px-2 py-2 font-medium text-gray-500 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => {
                  const st = statutLabel[o.statut];
                  return (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/commandes-recues')}>
                      <td className="px-2 py-3">{o.acheteurNom}</td>
                      <td className="px-2 py-3 text-gray-500">{o.itemsCount} article{o.itemsCount > 1 ? 's' : ''}</td>
                      <td className="px-2 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-2 py-3 text-right font-semibold text-sage-700">{o.total.toFixed(2)} €</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
