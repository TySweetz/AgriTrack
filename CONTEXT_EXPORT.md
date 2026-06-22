# AgriTrack — Contexte technique (export pour une autre session Claude)

Plateforme agricole : vendeurs (agriculteurs) vendent des produits à des acheteurs via une marketplace.

## Stack
- Backend : NestJS + TypeORM (PostgreSQL), `synchronize: true` (pas de migrations en V1).
- Frontend : React + Vite + TypeScript + Tailwind CSS, React Router, lucide-react.
- Auth : JWT (`JwtAuthGuard`), pattern `@Request() req: any` → `req.user.id`.
- Déploiement local : Docker Compose — `agritrack-db` (Postgres 15), `agritrack-backend` (port 3000), `agritrack-frontend` (build statique servi par `serve`, port 8080).
  **Important** : un changement de code n'est pris en compte qu'après `docker compose build <service> && docker compose up -d` — un simple restart ne suffit pas (Dockerfiles bake le build à l'image).

## Pièges connus
- **TypeORM `select` n'est PAS appliqué sur une relation `eager: true`** : la requête générée sélectionne quand même toutes les colonnes (mot de passe inclus). Fix systématique : ne jamais renvoyer l'entité brute, toujours construire un objet assaini à la main (voir `sanitizeProduct`/`sanitizeOrder` dans `product.service.ts`/`order.service.ts`).
- CSS : mettre `overflow-x` à une valeur non-`visible` force implicitement `overflow-y: auto`, ce qui clippe les dropdowns positionnés en absolu qui dépassent en bas (utiliser `flex-wrap` à la place pour une rangée de filtres scrollable).
- Vite : `vite.config.ts` fige `server.port`/`hmr.port` à 8080 — lancer le dev server sur un autre port casse le HMR (websocket mismatch) et donne des résultats de test trompeurs.
- Routing React : `AppLayout` choisit `BuyerLayout` vs `SellerLayout` selon `user.role`. Il faut bien attendre `isLoading` avant de choisir — sinon, pendant la réhydratation de l'auth après un hard refresh, `user` est `null` un instant, `BuyerLayout` est choisi par défaut, et son catch-all (`*` → `Navigate to="/"`) redirige avant que le vrai rôle soit connu (bug réel rencontré et corrigé).

## Modèle de domaine
- **User** : rôle `acheteur` ou `agriculteur`, switchable via `/profil` (`switchRole`). Un agriculteur doit avoir `entreprise` + `telephone` (demandés une seule fois, persistés). Un acheteur doit avoir un `pseudo` (demandé une seule fois). Le switch ne re-demande jamais ces infos si déjà enregistrées.
- **Product** : `actif` (toggle manuel de publication, contrôlé par le vendeur) est **découplé** de `stock`. Quand le stock tombe à 0 lors d'une commande, on clamp juste `stock = 0` — on ne désactive plus le produit automatiquement (c'était un bug : ça le rendait invisible partout, avis perdus de vue). Comportement attendu :
  - Marketplace générale (`findAll`) : `actif=true AND stock>0` uniquement (pas de rupture affichée ici).
  - Page boutique publique d'un vendeur (`findByVendeurPublic`, route `GET /products/vendeur/:id/public`) : `actif=true` peu importe le stock → les ruptures restent visibles côté acheteur, taguées "Rupture", achat désactivé.
  - "Mes produits" côté vendeur (`findByVendeur`) : tout, sans filtre.
- **Order/OrderItem** : commande avec items snapshotés (nom produit, prix, unité au moment de l'achat).
- **Review** : avis liés à `productId` (uuid simple, pas de relation FK) + `acheteurId`, unique par (produit, acheteur). Upsert (un seul avis par acheteur/produit, modifiable). Gating "achat vérifié" façon Amazon : seul un acheteur ayant une commande au statut `livree` contenant ce produit peut laisser un avis. Le nom de l'acheteur est snapshoté (`acheteurNom`) plutôt que joint en live.
- **Invoice / DeliveryNote** : documents générés côté vendeur, pattern snapshot/dénormalisation (jamais de jointure live vers des données qui peuvent changer).

## Frontend — pages clés
- `ProductDetail.tsx` est un composant **partagé**, monté sur deux routes :
  - `/produit/:id` (côté acheteur, `BuyerLayout`) : photo, description, avis, ajout au panier.
  - `/mes-produits/:id` (côté vendeur, `SellerLayout`) : même page mais en mode "propriétaire" (`isOwner = user?.id === product.vendeurId`) — pas de panier, bouton "Modifier ce produit" qui navigue vers `/mes-produits?edit=<id>` pour rouvrir directement la modale d'édition pré-remplie.
- `utils/media.ts` → `getPhotoUrl()` : préfixe les chemins relatifs (`/uploads/...`) avec `VITE_API_URL`. Tous les affichages de photo produit doivent passer par là (un oubli direct cause des images cassées).
- `components/Stars.tsx` : composant d'affichage d'étoiles partagé (Dashboard, ProductDetail).

## Méthode de vérification utilisée dans ce projet
- Type-check systématique avant de considérer un changement terminé : `npx tsc --noEmit` (backend) et `npm run build` (frontend, qui inclut `tsc`).
- Vérification visuelle réelle via Playwright (chromium headless), installé à la volée dans un dossier temporaire (`/tmp/pwX`, `npm install playwright`) plutôt que comme dépendance du projet.
- Comptes/produits de test créés via l'UI elle-même (pas d'insertion SQL directe pour les données de test), puis nettoyés après coup avec `docker exec agritrack-db psql ... DELETE` ciblé.
- Rebuild Docker requis avant toute vérification "réelle" : `docker compose build frontend backend && docker compose up -d`.
