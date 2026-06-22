import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, SlidersHorizontal, X } from 'lucide-react';
import { productsApi, Product } from '../api/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, LABELS } from '../constants/product';

type SortOption = 'recent' | 'prix_asc' | 'prix_desc';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Filtres
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [inStockOnly, setInStockOnly] = useState(false);

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
    setPriceMin(''); setPriceMax(''); setSort('recent'); setInStockOnly(false);
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
    if (inStockOnly) list = list.filter((p) => Number(p.stock) > 0);
    if (sort === 'prix_asc') list.sort((a, b) => Number(a.prix) - Number(b.prix));
    if (sort === 'prix_desc') list.sort((a, b) => Number(b.prix) - Number(a.prix));
    return list;
  }, [products, search, selectedCats, selectedLabels, priceMin, priceMax, sort, inStockOnly]);

  const activeFilterCount = selectedCats.length + selectedLabels.length +
    (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (inStockOnly ? 1 : 0);

  const handleAdd = (product: Product) => {
    add(product, qtyMap[product.id] ?? 1);
    addToast(`${product.nom} ajouté au panier 🛒`, 'success');
  };

  const photoUrl = (p: Product) =>
    p.photo ? (p.photo.startsWith('http') ? p.photo : `${API_URL}${p.photo}`) : null;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Tri */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Trier par</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
        >
          <option value="recent">Plus récents</option>
          <option value="prix_asc">Prix croissant</option>
          <option value="prix_desc">Prix décroissant</option>
        </select>
      </div>

      {/* Catégories */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Catégories</p>
        <div className="space-y-1.5">
          {CATEGORIES.map(({ value, emoji }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCats.includes(value)}
                onChange={() => toggleCat(value)}
                className="w-4 h-4 accent-sage-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-sage-700">
                {emoji} {value}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Certification</p>
        <div className="space-y-1.5">
          {LABELS.map((label) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer group">
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

      {/* Prix */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Prix (€)</p>
        <div className="flex gap-2 items-center">
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
      </div>

      {/* Disponibilité */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="w-4 h-4 accent-sage-600"
        />
        <span className="text-sm text-gray-700">En stock uniquement</span>
      </label>

      {activeFilterCount > 0 && (
        <button onClick={resetFilters} className="w-full border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Barre recherche + bouton filtre */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher un produit, producteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
        />
        <button
          onClick={() => setShowFilters(true)}
          className="md:hidden relative flex items-center gap-2 border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal size={16} />
          Filtres
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-sage-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filtres — desktop */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Filtres</p>
              {activeFilterCount > 0 && (
                <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-medium">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Grille produits */}
        <div className="flex-1 min-w-0">
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
                    {photoUrl(product) ? (
                      <img src={photoUrl(product)!} alt={product.nom} className="h-40 w-full object-cover" />
                    ) : (
                      <div className="h-40 bg-sage-50 flex items-center justify-center text-4xl">
                        {CATEGORIES.find((c) => c.value === product.categorie)?.emoji ?? '🌿'}
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{product.nom}</h3>
                        <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full shrink-0">{product.categorie}</span>
                      </div>
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
      </div>

      {/* Drawer filtres mobile */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="w-80 bg-white h-full overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-gray-900">Filtres</p>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setShowFilters(false)}
              className="mt-6 w-full bg-sage-600 text-white font-medium py-3 rounded-lg hover:bg-sage-700"
            >
              Voir les résultats ({filtered.length})
            </button>
          </div>
        </div>
      )}
    </>
  );
};
