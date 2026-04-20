# Architecture et fonctionnement

## Vue d'ensemble

AgriTrack est une application web full-stack composée de :

- **Frontend** : Interface React responsive (React 18 + Vite + Tailwind CSS)
- **Backend** : API REST NestJS avec TypeORM
- **Base de données** : PostgreSQL 15
- **Infrastructure** : Docker Compose pour orchestration

## Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  http://localhost:8080                                      │
├─────────────────────────────────────────────────────────────┤
│  Pages: Dashboard | Inventaire | Livraisons | Clients       │
│  Composants: Button, Card, Modal, Navbar, Toast            │
│  API: axios client configuré pour backend                   │
├─────────────────────────────────────────────────────────────┤
│         HTTP API (REST) sur http://localhost:3000           │
├─────────────────────────────────────────────────────────────┤
│                   Backend (NestJS + TypeORM)               │
├─────────────────────────────────────────────────────────────┤
│  Modules:                                                    │
│  • Inventory (stocks)                                       │
│  • Clients (acheteurs)                                      │
│  • Deliveries (livraisons)                                  │
│  • Dashboard (agrégats)                                     │
├─────────────────────────────────────────────────────────────┤
│        PostgreSQL Database (localhost:5432)                 │
├─────────────────────────────────────────────────────────────┤
│  Tables: inventory | clients | deliveries                   │
│  Données: automatiquement créées par TypeORM sync           │
└─────────────────────────────────────────────────────────────┘
```

## Flux de données

### 1. Utilisateur ajoute un stock (Inventaire)

```
Formulaire React
    ↓
inventoryApi.create(data)  [axios POST]
    ↓
Backend: POST /inventory
    ↓
InventoryService.create()
    ↓
TypeORM sauvegarde dans PostgreSQL
    ↓
Réponse: Inventory créé
    ↓
État React mis à jour
    ↓
Liste refreshed
```

### 2. Dashboard charge les métriques

```
useEffect() au démarrage
    ↓
dashboardApi.getAll()
    ↓
Backend: GET /dashboard
    ↓
DashboardService calcule:
  - total_stock_kg (SUM from inventory)
  - total_vendu_kg (SUM from deliveries)
  - moyenne_kg_panier (AVG from inventory)
  - livraisons_recentes (SELECT ... LIMIT 5)
    ↓
Réponse JSON avec agrégats
    ↓
React affiche dans 4 cards
```

## Modèle de données

### Table: inventory
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  nombre_paniers INTEGER NOT NULL,
  poids_moyen_panier DECIMAL(10,2) DEFAULT 5,
  stock_total_kg DECIMAL(12,2) GENERATED AS (nombre_paniers * poids_moyen_panier),
  date TIMESTAMP DEFAULT NOW()
);
```

### Table: clients
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  adresse TEXT
);
```

### Table: deliveries
```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY,
  date TIMESTAMP DEFAULT NOW(),
  lieu VARCHAR(255) NOT NULL,
  quantite_kg DECIMAL(10,2) NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE
);
```

## API Endpoints

### Inventory
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/inventory` | Liste tous les stocks |
| POST | `/inventory` | Crée un nouveau stock |
| PATCH | `/inventory/:id` | Met à jour un stock |
| DELETE | `/inventory/:id` | Supprime un stock |

### Clients
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/clients` | Liste tous les clients |
| POST | `/clients` | Crée un nouveau client |
| PATCH | `/clients/:id` | Met à jour un client |
| DELETE | `/clients/:id` | Supprime un client |

### Deliveries
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/deliveries` | Liste toutes les livraisons |
| POST | `/deliveries` | Crée une nouvelle livraison |
| PATCH | `/deliveries/:id` | Met à jour une livraison |
| DELETE | `/deliveries/:id` | Supprime une livraison |

### Dashboard
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard` | Récupère les agrégats |

## État de l'application

Le frontend gère l'état localement avec `useState` dans chaque composant :

```tsx
// Exemple page Inventaire
const [inventories, setInventories] = useState<Inventory[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);
```

**Pour une application en production**, considérez :
- Redux / Zustand pour la gestion d'état globale
- React Query pour le caching des données API
- Socket.io pour les mises à jour en temps réel

## Sécurité (V1)

En V1, l'application est sans authentification :
- CORS activé pour `*`
- Pas de validation côté client strict
- Pas de chiffrement des données
- TypeORM synchronize = true (à désactiver en prod)

**Pour production** :
- Implémenter JWT authentication
- Ajouter validateurs (class-validator)
- Configurer CORS strictement
- Utiliser les migrations TypeORM
- Ajouter une couche d'autorisation

## Performance

### Frontend
- Vite pour un dev server ultrarapide
- Code splitting automatique
- Tree-shaking des dépendances
- Lazy loading des pages avec React Router

### Backend
- Eager loading des relations (ex: client dans deliveries)
- Queries optimisées avec TypeORM QueryBuilder
- Pagination possible pour listes longues

### Base de données
- Indexes sur les colonnes clés (à ajouter si données volumineuses)
- Connections pooling par défaut
- Backups volumetriques recommandés en production

## Déploiement

### Docker

L'application est entièrement dockerisée :

```bash
# Build les images
docker-compose build

# Lance les services
docker-compose up

# Logs
docker-compose logs -f

# Arrête
docker-compose down
```

### Services Docker

1. **frontend** : Vite dev server → nginx production
2. **backend** : Node.js + NestJS
3. **db** : PostgreSQL avec volume de persistance

### Volumes
- `postgres_data:/var/lib/postgresql/data` - Persistance des données

## Extension future

Fonctionnalités possibles :

- [ ] Authentification et autorisation
- [ ] Export données (CSV, PDF)
- [ ] Statistiques avancées (graphes)
- [ ] Alertes stock bas
- [ ] Notifications temps réel (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Intégration paiements
- [ ] Historique audit
- [ ] Backups automatiques
- [ ] CI/CD avec GitHub Actions

## Debugging

### Backend

```bash
# Logs NestJS
docker-compose logs -f backend

# Shell du container
docker-compose exec backend sh

# Accès à la DB
docker-compose exec db psql -U admin -d asperges

# Vérifier l'API
curl http://localhost:3000/dashboard
```

### Frontend

```bash
# Logs du container
docker-compose logs -f frontend

# Console navigateur (DevTools)
F12 ou Ctrl+Shift+I

# Network tab pour déboguer les appels API
```

## Support

Consultez les fichiers :
- `README.md` - Documentation globale
- `QUICKSTART.md` - Démarrage rapide
- `CONTRIBUTING.md` - Guide de développement
