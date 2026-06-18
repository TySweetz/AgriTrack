import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { productsApi, Product } from '../api/products';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, LABELS, UNITES } from '../constants/product';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const emptyForm = {
  nom: '', description: '', prix: '', unite: 'kg', stock: '',
  categorie: 'Légumes', label: 'Conventionnel', photo: '', actif: true,
};

export const MesProduits = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const load = () =>
    productsApi.getMine().then((r) => { setProducts(r.data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setPreviewUrl('');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      nom: p.nom, description: p.description || '', prix: String(p.prix),
      unite: p.unite, stock: String(p.stock), categorie: p.categorie,
      label: p.label || 'Conventionnel', photo: p.photo || '', actif: p.actif,
    });
    const url = p.photo ? (p.photo.startsWith('http') ? p.photo : `${API_URL}${p.photo}`) : '';
    setPreviewUrl(url);
    setShowModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploadingImg(true);
    try {
      const res = await productsApi.uploadImage(file);
      setForm((f) => ({ ...f, photo: res.data.url }));
    } catch {
      addToast("Erreur lors de l'upload de l'image", 'error');
      setPreviewUrl('');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingImg) { addToast("Image en cours d'upload...", 'info'); return; }
    setSaving(true);
    try {
      const payload = { ...form, prix: Number(form.prix), stock: Number(form.stock) };
      if (editing) {
        await productsApi.update(editing.id, payload);
        addToast('Produit mis à jour', 'success');
      } else {
        await productsApi.create(payload);
        addToast('Produit créé', 'success');
      }
      setShowModal(false);
      load();
    } catch {
      addToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await productsApi.remove(id);
      addToast('Produit supprimé', 'success');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const photoDisplayUrl = (p: Product) =>
    p.photo ? (p.photo.startsWith('http') ? p.photo : `${API_URL}${p.photo}`) : null;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes produits</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🌿</div>
          <p className="mb-4">Vous n'avez pas encore de produits.</p>
          <button onClick={openCreate} className="bg-sage-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-sage-700">
            Créer mon premier produit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className={`bg-white rounded-xl border overflow-hidden ${!p.actif ? 'opacity-60' : 'border-gray-200'}`}>
              {photoDisplayUrl(p) ? (
                <img src={photoDisplayUrl(p)!} alt={p.nom} className="h-36 w-full object-cover" />
              ) : (
                <div className="h-36 bg-sage-50 flex items-center justify-center text-3xl">
                  {CATEGORIES.find((c) => c.value === p.categorie)?.emoji ?? '🌿'}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{p.nom}</h3>
                  {!p.actif && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Inactif</span>}
                </div>
                <p className="text-sm text-sage-700 font-medium">{Number(p.prix).toFixed(2)} € / {p.unite}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-400">Stock : {p.stock} {p.unite}</p>
                  {p.label && p.label !== 'Conventionnel' && (
                    <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">{p.label}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 text-xs font-medium py-2 rounded-lg hover:bg-gray-50">
                    <Pencil size={13} /> Modifier
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="flex items-center justify-center w-9 border border-red-200 text-red-500 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo du produit</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-sage-400 transition-colors"
                  style={{ height: previewUrl ? 'auto' : '120px' }}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="preview" className="w-full h-48 object-cover" />
                      {uploadingImg && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-white/90 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 flex items-center gap-1">
                        <ImagePlus size={13} /> Changer
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                      <ImagePlus size={28} />
                      <p className="text-sm">Cliquer pour ajouter une photo</p>
                      <p className="text-xs">JPG, PNG, WEBP — max 5 Mo</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} className="hidden" />
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                <input type="text" value={form.nom} onChange={set('nom')} required placeholder="Asperges blanches" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Décrivez votre produit..." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none" />
              </div>

              {/* Catégorie + Label */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie <span className="text-red-500">*</span></label>
                  <select value={form.categorie} onChange={set('categorie')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400">
                    {CATEGORIES.map(({ value, emoji }) => (
                      <option key={value} value={value}>{emoji} {value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                  <select value={form.label} onChange={set('label')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400">
                    {LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Prix + Unité */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.prix} onChange={set('prix')} required min={0} step={0.01} placeholder="4.50" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité <span className="text-red-500">*</span></label>
                  <select value={form.unite} onChange={set('unite')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400">
                    {UNITES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock disponible <span className="text-red-500">*</span></label>
                <input type="number" value={form.stock} onChange={set('stock')} required min={0} step={0.1} placeholder="50" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
              </div>

              {/* Actif (edit only) */}
              {editing && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.actif as boolean} onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))} className="w-4 h-4 accent-sage-600" />
                  <span className="text-sm text-gray-700">Produit visible sur la marketplace</span>
                </label>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving || uploadingImg} className="flex-1 bg-sage-600 hover:bg-sage-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
