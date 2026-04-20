# QUICKSTART.md - Guide de démarrage rapide

## Démarrage en 3 étapes

### 1. Prérequis

Installer Docker Desktop depuis https://www.docker.com/products/docker-desktop/

### 2. Démarrer l'application

```bash
# Se placer dans le dossier du projet
cd "c:\Users\t3yll\Desktop\Nouveau dossier"

# Lancer l'application
docker-compose up --build
```

### 3. Accéder à l'application

- **Frontend** : https://localhost:8080
- **Backend API** : https://localhost:3000
- **PostgreSQL** : localhost:5432 (user: admin, password: admin)

---

## Commandes principales

```bash
# Lancer l'app
docker-compose up

# Lancer en arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter l'app
docker-compose down

# Redémarrer
docker-compose restart

# Supprimer tout (y compris la base de données)
docker-compose down -v
```

---

## Fonctionnalités disponibles

### 📊 Dashboard
- Affichage des métriques clés (stock, vendu, livraisons)
- Tableau des 5 dernières livraisons
- Accès rapide aux autres pages

### 📦 Inventaire
- Ajouter/modifier/supprimer des stocks
- Calcul automatique du poids total
- Vue d'ensemble du stock total

### 🚚 Livraisons
- Enregistrer les livraisons
- Sélectionner clients dans un dropdown
- Historique complet

### 👥 Clients
- Créer/modifier/supprimer clients
- Informations de contact
- Liste complète

---

## Test rapide

Une fois l'app lancée :

1. Aller à http://localhost:8080
2. Cliquer sur "Clients" → Ajouter un client
3. Cliquer sur "Inventaire" → Ajouter un stock
4. Cliquer sur "Livraisons" → Créer une livraison
5. Voir les données s'afficher dans le Dashboard

---

## Troubleshooting

### L'app ne démarre pas
```bash
docker-compose down -v
docker-compose up --build
```

### Le port 8080 ou 3000 est déjà utilisé
```bash
# Libérer le port (Windows)
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Erreur de connexion à la base de données
```bash
# Attendre 30 secondes et réessayer
docker-compose logs db
```

---

## Structructure du projet

```
.
├── docker-compose.yml      # Configuration des 3 services
├── README.md              # Documentation complète
├── CONTRIBUTING.md        # Guide de développement
│
├── backend/               # API NestJS
│   ├── src/
│   │   ├── inventory/     # Module stocks
│   │   ├── clients/       # Module clients  
│   │   ├── deliveries/    # Module livraisons
│   │   ├── dashboard/     # Agrégats
│   │   └── app.module.ts
│   └── Dockerfile
│
└── frontend/              # Interface React
    ├── src/
    │   ├── pages/         # 4 pages React
    │   ├── components/    # Composants réutilisables
    │   └── api/           # Appels HTTP
    └── Dockerfile
```

---

## Support

Consultez `README.md` pour la documentation complète.
Consultez `CONTRIBUTING.md` pour le développement avancé.
