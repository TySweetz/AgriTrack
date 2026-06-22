import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { deliveryNotesApi, DeliveryNoteDocument } from '../api/deliveryNotes';

export const BonLivraison = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DeliveryNoteDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Bon de livraison introuvable');
      setLoading(false);
      return;
    }

    deliveryNotesApi.getDocument(id)
      .then(setDocument)
      .catch(() => setError('Impossible de charger le bon de livraison'))
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
            <Button variant="secondary" onClick={() => navigate('/livraisons')}>
              <ArrowLeft size={16} className="mr-2" /> Retour
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { note } = document;

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 md:pb-8 print:p-0 print:max-w-none">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Button variant="secondary" onClick={() => navigate('/livraisons')}>
          <ArrowLeft size={16} className="mr-2" /> Retour
        </Button>
        <Button onClick={handlePrint}>
          <Printer size={16} className="mr-2" /> Imprimer
        </Button>
      </div>

      <Card className="print:shadow-none print:border-0">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bon de livraison</h1>
            <p className="text-gray-500">Référence : {document.printableReference}</p>
            <p className="text-gray-500">Date : {document.printableDate}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold text-gray-800">{note.vendeurNom}</p>
          </div>
        </div>

        <div className="border rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Client</p>
          <p className="font-semibold text-gray-800">{note.acheteurNom}</p>
          {note.adresseLivraison && <p className="text-sm text-gray-600">📍 {note.adresseLivraison}</p>}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Produit</th>
                <th className="text-right px-4 py-3">Quantité</th>
              </tr>
            </thead>
            <tbody>
              {note.items.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3">{item.nomProduit}</td>
                  <td className="px-4 py-3 text-right">{item.quantite} {item.unite}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
