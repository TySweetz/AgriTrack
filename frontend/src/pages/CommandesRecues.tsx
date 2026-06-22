import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Truck } from 'lucide-react';
import { ordersApi, Order } from '../api/orders';
import { invoicesApi, Invoice } from '../api/invoices';
import { deliveryNotesApi, DeliveryNote } from '../api/deliveryNotes';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const statutLabel: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  acceptee: { label: 'Acceptée', color: 'bg-green-100 text-green-700' },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
  livree: { label: 'Livrée', color: 'bg-blue-100 text-blue-700' },
};

export const CommandesRecues = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoicesByOrder, setInvoicesByOrder] = useState<Record<string, Invoice>>({});
  const [notesByOrder, setNotesByOrder] = useState<Record<string, DeliveryNote>>({});
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState<string | null>(null);
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = () =>
    Promise.all([ordersApi.getReceived(), invoicesApi.getAll(), deliveryNotesApi.getAll()]).then(
      ([ordersRes, invoices, notes]) => {
        setOrders(ordersRes.data);
        setInvoicesByOrder(Object.fromEntries(invoices.map((i) => [i.orderId, i])));
        setNotesByOrder(Object.fromEntries(notes.map((n) => [n.orderId, n])));
        setLoading(false);
      },
    );

  useEffect(() => { load(); }, [user?.id]);

  const updateStatus = async (id: string, statut: string) => {
    try {
      const updated = await ordersApi.updateStatus(id, statut);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated.data : o)));
      addToast('Statut mis à jour', 'success');
      load();
    } catch {
      addToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const openInvoice = async (orderId: string) => {
    const existing = invoicesByOrder[orderId];
    if (existing) { navigate(`/factures/${existing.id}`); return; }
    setDocLoading(orderId + '-facture');
    try {
      const invoice = await invoicesApi.generate(orderId);
      navigate(`/factures/${invoice.id}`);
    } catch {
      addToast('Impossible de générer la facture', 'error');
    } finally {
      setDocLoading(null);
    }
  };

  const openDeliveryNote = async (orderId: string) => {
    const existing = notesByOrder[orderId];
    if (existing) { navigate(`/livraisons/${existing.id}`); return; }
    setDocLoading(orderId + '-bon');
    try {
      const note = await deliveryNotesApi.generate(orderId);
      navigate(`/livraisons/${note.id}`);
    } catch {
      addToast('Impossible de générer le bon de livraison', 'error');
    } finally {
      setDocLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Commandes reçues</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📬</div>
          <p>Aucune commande reçue pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = statutLabel[order.statut];
            const acheteurNom = order.acheteur?.pseudo || order.acheteur?.nom || 'Acheteur';
            const canHaveInvoice = order.statut === 'acceptee' || order.statut === 'livree';
            const canHaveDeliveryNote = order.statut === 'livree';
            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{acheteurNom}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                      {' · '}#{order.id.slice(0, 8).toUpperCase()}
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
                      <span className="font-medium">{Number(item.sousTotal).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>

                {order.adresseLivraison && (
                  <p className="text-xs text-gray-500 mb-2">📍 {order.adresseLivraison}</p>
                )}
                {order.message && (
                  <p className="text-xs text-gray-400 italic mb-3">"{order.message}"</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-wrap gap-2">
                  <span className="font-bold text-sage-700">{Number(order.total).toFixed(2)} €</span>
                  <div className="flex gap-2 flex-wrap">
                    {canHaveInvoice && (
                      <button
                        onClick={() => openInvoice(order.id)}
                        disabled={docLoading === order.id + '-facture'}
                        className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <FileText size={14} /> Facture
                      </button>
                    )}
                    {canHaveDeliveryNote && (
                      <button
                        onClick={() => openDeliveryNote(order.id)}
                        disabled={docLoading === order.id + '-bon'}
                        className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Truck size={14} /> Bon de livraison
                      </button>
                    )}
                    {order.statut === 'en_attente' && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'refusee')}
                          className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          Refuser
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'acceptee')}
                          className="px-3 py-1.5 text-xs font-medium bg-sage-600 text-white rounded-lg hover:bg-sage-700"
                        >
                          Accepter
                        </button>
                      </>
                    )}
                    {order.statut === 'acceptee' && (
                      <button
                        onClick={() => updateStatus(order.id, 'livree')}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Marquer livrée
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
