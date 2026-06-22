import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ShoppingCart, X } from 'lucide-react';
import { productsApi, Product } from '../api/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, LABELS } from '../constants/product';
import { getPhotoUrl } from '../utils/media';

type SortOption = 'recent' | 'prix_asc' | 'prix_desc';
type FilterKey = 'sort' | 'cat' | 'label' | 'price' | null;

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Plus récents',
  prix_asc: 'Prix croissant',
  prix_desc: 'Prix décroissant',
};

export const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [openFilter, setOpenFilter] = useState<FilterKey>(null);

  // Filtres
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');

  const { add } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    productsApi.getAll().then((r) => { setProducts(r.data); setLoading(false); });
  }, []);

  const toggleCat = (cat: string) =>
    setSelectedCats((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const toggleLabel = (label: string) =>
    setSelectedLabels((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);

  const resetFilters = () => {
    setSearch(''); setSelectedCats([]); setSelectedLabels([]);
    setPriceMin(''); setPriceMax(''); setSort('recent');
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.nom.toLowerCase().includes(q) ||
        (p.vendeur.entreprise || p.vendeur.nom).toLowerCase().includes(q) ||
        p.categorie.toLowerCase().includes(q),
      );
    }
    if (selectedCats.length) list = list.filter((p) => selectedCats.includes(p.categorie));
    if (selectedLabels.length) list = list.filter((p) => selectedLabels.includes(p.label));
    if (priceMin) list = list.filter((p) => Number(p.prix) >= Number(priceMin));
    if (priceMax) list = list.filter((p) => Number(p.prix) <= Number(priceMax));
    if (sort === 'prix_asc') list.sort((a, b) => Number(a.prix) - Number(b.prix));
    if (sort === 'prix_desc') list.sort((a, b) => Number(b.prix) - Number(a.prix));
    return list;
  }, [products, search, selectedCats, selectedLabels, priceMin, priceMax, sort]);

  const activeFilterCount = selectedCats.length + selectedLabels.length +
    (priceMin ? 1 : 0) + (priceMax ? 1 : 0);

  const handleAdd = (product: Product) => {
    add(product, qtyMap[product.id] ?? 1);
    addToast(`${product.nom} ajouté au panier 🛒`, 'success');
  };

  const photoUrl = (p: Product) => getPhotoUrl(p.photo);

  const toggleFilter = (key: Exclude<FilterKey, null>) =>
    setOpenFilter((prev) => (prev === key ? null : key));

  const removeCat = (cat: string) => setSelectedCats((prev) => prev.filter((c) => c !== cat));
  const removeLabel = (label: string) => setSelectedLabels((prev) => prev.filter((l) => l !== label));

  const pillClass = (active: boolean) =>
    `flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${
      active
        ? 'bg-sage-600 border-sage-600 text-white'
        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
    }`;

  return (
    <>
      {/* Barre recherche */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Rechercher un produit, producteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
        />
      </div>

      {/* Barre de filtres façon Leboncoin/Amazon */}
      <div className="relative z-20 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Trier */}
          <div className="relative z-20">
            <button onClick={() => toggleFilter('sort')} className={pillClass(sort !== 'recent')}>
              {SORT_LABELS[sort]} <ChevronDown size={14} />
            </button>
            {openFilter === 'sort' && (
              <div className="absolute left-0 top-full mt-2 z-30 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
                {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => { setSort(value); setOpenFilter(null); }}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      sort === value ? 'bg-sage-50 text-sage-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Catégories */}
          <div className="relative z-20">
            <button onClick={() => toggleFilter('cat')} className={pillClass(selectedCats.length > 0)}>
              Catégorie {selectedCats.length > 0 && `(${selectedCats.length})`} <ChevronDown size={14} />
            </button>
            {openFilter === 'cat' && (
              <div className="absolute left-0 top-full mt-2 z-30 w-64 max-w-[85vw] bg-white border border-gray-200 rounded-xl shadow-lg p-3 max-h-80 overflow-y-auto">
                <div className="space-y-1">
                  {CATEGORIES.map(({ value, emoji }) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer group px-2 py-1.5 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(value)}
                        onChange={() => toggleCat(value)}
                        className="w-4 h-4 accent-sage-600"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-sage-700">{emoji} {value}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Certification */}
          <div className="relative z-20">
            <button onClick={() => toggleFilter('label')} className={pillClass(selectedLabels.length > 0)}>
              Certification {selectedLabels.length > 0 && `(${selectedLabels.length})`} <ChevronDown size={14} />
            </button>
            {openFilter === 'label' && (
              <div className="absolute left-0 top-full mt-2 z-30 w-56 max-w-[85vw] bg-white border border-gray-200 rounded-xl shadow-lg p-3 max-h-80 overflow-y-auto">
                <div className="space-y-1">
                  {LABELS.map((label) => (
                    <label key={label} className="flex items-center gap-2 cursor-pointer group px-2 py-1.5 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedLabels.includes(label)}
                        onChange={() => toggleLabel(label)}
                        className="w-4 h-4 accent-sage-600"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-sage-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prix */}
          <div className="relative z-20">
            <button onClick={() => toggleFilter('price')} className={pillClass(!!priceMin || !!priceMax)}>
              Prix {(priceMin || priceMax) && `${priceMin || '0'}–${priceMax || '∞'} €`} <ChevronDown size={14} />
            </button>
            {openFilter === 'price' && (
              <div className="absolute left-0 top-full mt-2 z-30 w-64 max-w-[85vw] bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Fourchette de prix (€)</p>
                <div className="flex gap-2 items-center mb-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    min={0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                  />
                  <span className="text-gray-400 shrink-0">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    min={0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                  />
                </div>
                <button
                  onClick={() => setOpenFilter(null)}
                  className="w-full bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium py-2 rounded-lg"
                >
                  Appliquer
                </button>
              </div>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="relative z-20 flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 whitespace-nowrap"
            >
              <X size={14} /> Effacer
            </button>
          )}
        </div>

        {/* Tags des filtres actifs */}
        {(selectedCats.length > 0 || selectedLabels.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {selectedCats.map((cat) => (
              <span key={cat} className="flex items-center gap-1 bg-sage-50 text-sage-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
                {cat}
                <button onClick={() => removeCat(cat)} className="hover:bg-sage-100 rounded-full p-0.5">
                  <X size={11} />
                </button>
              </span>
            ))}
            {selectedLabels.map((label) => (
              <span key={label} className="flex items-center gap-1 bg-sage-50 text-sage-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
                {label}
                <button onClick={() => removeLabel(label)} className="hover:bg-sage-100 rounded-full p-0.5">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Overlay pour fermer le dropdown ouvert */}
        {openFilter && (
          <div className="fixed inset-0 z-10" onClick={() => setOpenFilter(null)} />
        )}
      </div>

      {/* Grille produits */}
      <div>
        {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p>Aucun produit ne correspond à vos critères.</p>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="mt-4 text-sage-600 text-sm font-medium hover:underline">
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{filtered.length} produit{filtered.length > 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                    <Link to={`/produit/${product.id}`}>
                      {photoUrl(product) ? (
                        <img src={photoUrl(product)!} alt={product.nom} className="h-40 w-full object-cover" />
                      ) : (
                        <div className="h-40 bg-sage-50 flex items-center justify-center text-4xl">
                          {CATEGORIES.find((c) => c.value === product.categorie)?.emoji ?? '🌿'}
                        </div>
                      )}
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <Link to={`/produit/${product.id}`} className="flex items-start justify-between gap-2 mb-1 hover:text-sage-700">
                        <h3 className="font-semibold text-gray-900 text-sm">{product.nom}</h3>
                        <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full shrink-0">{product.categorie}</span>
                      </Link>
                      {product.label && product.label !== 'Conventionnel' && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full w-fit mb-1">{product.label}</span>
                      )}
                      {product.description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                      )}
                      <Link to={`/vendeur/${product.vendeurId}`} className="text-xs text-gray-400 mb-3 hover:text-sage-600 hover:underline block">🌱 {product.vendeur.entreprise || product.vendeur.nom}</Link>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-base font-bold text-sage-700">
                            {Number(product.prix).toFixed(2)} €
                            <span className="text-xs font-normal text-gray-500"> / {product.unite}</span>
                          </span>
                          <span className={`text-xs ${Number(product.stock) > 0 ? 'text-gray-400' : 'text-red-400'}`}>
                            {Number(product.stock) > 0 ? `${product.stock} ${product.unite}` : 'Rupture'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                            <button
                              onClick={() => setQtyMap((m) => ({ ...m, [product.id]: Math.max(1, (m[product.id] ?? 1) - 1) }))}
                              className="w-8 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-sage-700 transition-colors font-semibold text-base"
                            >−</button>
                            <span className="w-8 text-center text-sm font-semibold text-gray-800 select-none">
                              {qtyMap[product.id] ?? 1}
                            </span>
                            <button
                              onClick={() => setQtyMap((m) => ({ ...m, [product.id]: Math.min(Number(product.stock), (m[product.id] ?? 1) + 1) }))}
                              disabled={Number(product.stock) <= 0}
                              className="w-8 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-sage-700 transition-colors font-semibold text-base disabled:opacity-30"
                            >+</button>
                          </div>
                          <button
                            onClick={() => handleAdd(product)}
                            disabled={Number(product.stock) <= 0}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <ShoppingCart size={14} />
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
    </>
  );
};
