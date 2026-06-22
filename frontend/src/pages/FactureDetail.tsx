import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { invoicesApi, InvoiceDocument } from '../api/invoices';

export const FactureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<InvoiceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Facture introuvable');
      setLoading(false);
      return;
    }

    invoicesApi.getDocument(id)
      .then(setDocument)
      .catch(() => setError('Impossible de charger la facture'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

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
            <p className="text-gray-500">Référence : {document.printableReference}</p>
            <p className="text-gray-500">Date : {document.printableDate}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold text-gray-800">{invoice.vendeurNom}</p>
            {invoice.vendeurSiret && <p>SIRET : {invoice.vendeurSiret}</p>}
          </div>
        </div>

        <div className="border rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Client</p>
          <p className="font-semibold text-gray-800">{invoice.acheteurNom}</p>
          {invoice.acheteurAdresse && <p className="text-sm text-gray-600">{invoice.acheteurAdresse}</p>}
        </div>

        <div className="border rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Produit</th>
                <th className="text-right px-4 py-3">Qté</th>
                <th className="text-right px-4 py-3">PU</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3">{item.nomProduit}</td>
                  <td className="px-4 py-3 text-right">{item.quantite} {item.unite}</td>
                  <td className="px-4 py-3 text-right">{Number(item.prixUnitaire).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(item.sousTotal).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total HT</span>
              <span className="font-medium">{Number(invoice.montant_ht).toFixed(2)} €</span>
            </div>
            {invoice.assujetti_tva ? (
              <div className="flex justify-between">
                <span className="text-gray-500">TVA ({Number(invoice.taux_tva).toFixed(0)}%)</span>
                <span className="font-medium">{Number(invoice.montant_tva).toFixed(2)} €</span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic pt-1">TVA non applicable, article 293 B du CGI</p>
            )}
            <div className="flex justify-between pt-2 border-t text-base font-bold text-sage-700">
              <span>Total TTC</span>
              <span>{Number(invoice.montant_ttc).toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {document.signature?.enabled && document.signature.url && (
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-gray-500 mb-2">Signature</p>
            <img src={document.signature.url} alt="Signature" className="h-20 object-contain" />
          </div>
        )}
      </Card>
    </div>
  );
};
