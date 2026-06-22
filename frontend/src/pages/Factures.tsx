import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { invoicesApi, Invoice } from '../api/invoices';
import { useAuth } from '../context/AuthContext';

export const Factures = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoicesApi.getAll().then(setInvoices).finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto pb-24 md:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Factures</h1>
        <p className="text-sm text-gray-500">
          Générées automatiquement dès qu'une commande est acceptée.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🧾</div>
            <p>Aucune facture pour l'instant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Facture</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Client</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">TTC</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{invoice.numero_facture}</td>
                    <td className="px-4 py-3">{invoice.acheteurNom}</td>
                    <td className="px-4 py-3">{new Date(invoice.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right font-semibold text-sage-700">
                      {Number(invoice.montant_ttc).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/factures/${invoice.id}`)}
                        className="text-sage-700 hover:text-sage-900 inline-flex items-center gap-1"
                      >
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
