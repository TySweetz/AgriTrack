export const BuyerFooter = () => (
  <footer className="bg-white border-t border-gray-200 mt-auto pb-16 md:pb-0">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-lg font-bold text-sage-700">🌱 AgriTrack</p>
          <p className="text-sm text-gray-500 mt-1">Produits frais, directement des agriculteurs.</p>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} AgriTrack — Tous droits réservés</p>
      </div>
    </div>
  </footer>
);
