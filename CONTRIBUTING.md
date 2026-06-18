# CONTRIBUTING.md

## Instructions de développement

### Prérequis
- Docker et Docker Compose
- Node.js 18+ (pour développement local sans Docker)
- Git

### Démarrage rapide

#### Avec Docker (recommandé)

```bash
# Cloner le repository
git clone <repo-url>
cd agritrack

# Copier les fichiers .env
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Démarrer l'application
docker-compose up --build

# Accéder à l'application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000
# Database: localhost:5432
```

#### Avec Docker Compose en mode watch (développement)

```bash
# Démarrer et vérifier les logs
docker-compose up --build -d
docker-compose logs -f backend
docker-compose logs -f frontend

# Arrêter
docker-compose down
```

### Développement local

#### Backend

```bash
cd backend
npm install
npm run dev
```

Le backend démarre sur `http://localhost:3000`

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:8080` (ou un autre port)

### Base de données

#### Accéder à PostgreSQL via Docker

```bash
docker-compose exec db psql -U admin -d asperges
```

#### Commandes utiles PostgreSQL

```sql
-- Voir les tables
\dt

-- Voir la structure d'une table
\d inventory

-- Voir les données
SELECT * FROM inventory;

-- Quitter
\q
```

### Commandes docker-compose utiles

```bash
# Démarrer les services
docker-compose up

# Reconstruire les images
docker-compose up --build

# Démarrer en arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Arrêter les services
docker-compose down

# Supprimer les volumes (purger la base de données)
docker-compose down -v

# Accéder aux shells
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec db bash

# Reconstruire un service
docker-compose up --build backend
```

### API Testing

```bash
# Récupérer tous les stocks
curl http://localhost:3000/inventory

# Ajouter un stock
curl -X POST http://localhost:3000/inventory \
  -H "Content-Type: application/json" \
  -d '{"nombre_paniers": 10, "poids_moyen_panier": 5.5}'

# Récupérer les données du dashboard
curl http://localhost:3000/dashboard

# Créer un client
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -d '{"nom": "Marché Central", "telephone": "01 23 45 67 89", "adresse": "Paris"}'
```

### Troubleshooting

#### Le backend n'accède pas à la base de données

```bash
# Vérifier que le service db est sain
docker-compose ps

# Vérifier les logs du service db
docker-compose logs db

# Redémarrer les services
docker-compose down
docker-compose up --build
```

#### Erreur "Cannot find module" au démarrage

```bash
# Nettoyer et reconstruire
docker-compose down -v
docker-compose up --build
```

#### Port déjà en utilisation

Modifier les ports dans `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3001:8080"  # Utiliser 3001 à la place de 8080
```

#### Les fichiers ne se synchronisent pas en développement

Vérifier le chemin du volume dans `docker-compose.yml` pour que les modifications soient synchronisées.

### Production Build

```bash
# Builder l'image frontend pour production
docker build -t agritrack-frontend:latest ./frontend

# Builder l'image backend pour production
docker build -t agritrack-backend:latest ./backend

# Démarrer les services en production
docker-compose -f docker-compose.yml up -d
```

## Architecture

### Backend (NestJS)

- `/inventory` - Gestion des stocks
- `/clients` - Gestion des clients
- `/deliveries` - Gestion des livraisons
- `/dashboard` - Agrégats et statistiques

### Frontend (React)

- `/` - Dashboard (métriques, dernières livraisons)
- `/inventaire` - Gestion des stocks
- `/livraisons` - Gestion des livraisons
- `/clients` - Gestion des clients

### Base de données (PostgreSQL)

Tables:
- `inventory` - Stocks d'asperges
- `clients` - Clients acheteurs
- `deliveries` - Livraisons (avec relation vers clients)

## Contribution

1. Créer une branche: `git checkout -b feature/ma-feature`
2. Commiter: `git commit -am 'Ajouter feature'`
3. Pousser: `git push origin feature/ma-feature`
4. Créer une Pull Request

## Support

Pour toute question ou problème, consultez la documentation README.md
