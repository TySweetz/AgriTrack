import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { invoicesApi, InvoiceDocument } from '../api/invoices';

/**
 * Page de consultation et impression d'une facture
 */
export const FactureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<InvoiceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) {
        setError('Facture introuvable');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await invoicesApi.getDocument(id);
        setDocument(data);
        setError(null);
      } catch (err) {
        setError('Impossible de charger la facture');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-4 max-w-4xl mx-auto">Chargement...</div>;
  }

  if (error || !document) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <p className="text-red-700">{error ?? 'Document introuvable'}</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate('/factures')}>
              <ArrowLeft size={16} className="mr-2" /> Retour
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { invoice } = document;

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 md:pb-8 print:p-0 print:max-w-none">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Button variant="secondary" onClick={() => navigate('/factures')}>
          <ArrowLeft size={16} className="mr-2" /> Retour
        </Button>
        <Button onClick={handlePrint}>
          <Printer size={16} className="mr-2" /> Imprimer
        </Button>
      </div>

      <Card className="print:shadow-none print:border-0">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Facture</h1>
            <p className="text-gray-500">Référence: {document.printableReference}</p>
            <p className="text-gray-500">Période: {document.printablePeriod}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold text-gray-800">AgriTrack</p>
            <p>Document de facturation</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Client</p>
            <p className="font-semibold text-gray-800">{invoice.client?.nom ?? 'Client inconnu'}</p>
            <p className="text-sm text-gray-600">{invoice.client?.adresse ?? ''}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Statut</p>
            <p className="font-semibold text-gray-800">{invoice.status}</p>
            <p className="text-sm text-gray-600">Total TTC: {Number(invoice.montant_ttc).toFixed(2)} €</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Kg</th>
                <th className="text-left px-4 py-3">PU / kg</th>
                <th className="text-left px-4 py-3">HT</th>
                <th className="text-left px-4 py-3">TVA</th>
                <th className="text-left px-4 py-3">TTC</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3">{Number(invoice.total_kg).toFixed(1)}</td>
                <td className="px-4 py-3">{Number(invoice.prix_unitaire_kg).toFixed(2)} €</td>
                <td className="px-4 py-3">{Number(invoice.montant_ht).toFixed(2)} €</td>
                <td className="px-4 py-3">{Number(invoice.montant_tva).toFixed(2)} €</td>
                <td className="px-4 py-3 font-semibold">{Number(invoice.montant_ttc).toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
        </div>

        {document.signature?.enabled && document.signature.url && (
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-gray-500 mb-2">Signature entreprise</p>
            <img
              src={document.signature.url}
              alt="Signature entreprise"
              className="h-20 object-contain"
            />
          </div>
        )}
      </Card>
    </div>
  );
};