import { useEffect, useState } from 'react';
import { ordersApi, Order } from '../api/orders';

const statutLabel: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  acceptee: { label: 'Acceptée', color: 'bg-green-100 text-green-700' },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
  livree: { label: 'Livrée', color: 'bg-blue-100 text-blue-700' },
};

export const MesCommandes = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getMine().then((r) => {
      setOrders(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p>Vous n'avez pas encore passé de commande.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = statutLabel[order.statut];
            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Commande #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${st.color}`}>
                    {st.label}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.nomProduit} × {item.quantite} {item.unite}
                      </span>
                      <span className="text-gray-900 font-medium">{Number(item.sousTotal).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="font-bold text-sage-700">{Number(order.total).toFixed(2)} €</span>
                </div>

                {order.message && (
                  <p className="text-xs text-gray-400 mt-2 italic">"{order.message}"</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
