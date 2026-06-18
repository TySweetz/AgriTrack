# DEPENDENCIES.md - Dépendances du projet

## Backend (NestJS)

### Production
- `@nestjs/common` - Core du framework
- `@nestjs/core` - Core runtime
- `@nestjs/platform-express` - Express adapter
- `@nestjs/typeorm` - ORM integration
- `typeorm` - Object-Relational Mapping
- `pg` - PostgreSQL driver
- `class-transformer` - Transformation de données
- `class-validator` - Validation de schémas
- `reflect-metadata` - Décorateurs TypeScript
- `rxjs` - Reactive programming
- `uuid` - Génération d'UUIDs

### Development
- `typescript` - TypeScript compiler
- `@nestjs/cli` - CLI NestJS
- `@nestjs/schematics` - Schematics pour CLI
- `@types/node` - Types Node.js

## Frontend (React)

### Production
- `react` - UI library
- `react-dom` - DOM renderer
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `lucide-react` - Icon library

### Development
- `typescript` - TypeScript compiler
- `vite` - Build tool & dev server
- `@vitejs/plugin-react` - React integration
- `@types/react` - React types
- `@types/react-dom` - React DOM types
- `tailwindcss` - CSS utility framework
- `postcss` - CSS processor
- `autoprefixer` - CSS vendor prefixes

## Infrastructure

### Docker
- `node:18-alpine` - Node.js base image
- `postgres:15` - PostgreSQL database

## Versions importantes

| Package | Version | Raison |
|---------|---------|--------|
| Node.js | 18-alpine | Léger, LTS, performant |
| React | ^18.2.0 | Dernière stable |
| NestJS | ^10.2.10 | Dernière stable |
| TypeScript | ^5.2.2 | Latest avec suppport ES2020 |
| Tailwind | ^3.3.6 | Utility-first CSS |
| PostgreSQL | 15 | Dernière stable |

## Installation des dépendances

### Avec Docker (recommandé)
```bash
docker-compose build
```

### Localement - Backend
```bash
cd backend
npm install
```

### Localement - Frontend
```bash
cd frontend
npm install
```

## Versions des dépendances

Pour vérifier les versions :

```bash
# Backend
docker-compose exec backend npm list

# Frontend
docker-compose exec frontend npm list
```

## Vulnérabilités

Pour scanner les vulnérabilités :

```bash
# Backend
docker-compose exec backend npm audit

# Frontend
docker-compose exec frontend npm audit

# Fixer automatiquement
npm audit fix
```

## Optimisation des dépendances

### Réduire la taille des images Docker

```dockerfile
# Utiliser npm ci pour les builds en CI
RUN npm ci --prefer-offline --no-audit

# Supprimer npm cache après build
RUN npm cache clean --force
```

### Tree-shaking en production

Vite active automatiquement le tree-shaking pour éliminer le code non utilisé.

## Mise à jour des dépendances

Avant de mettre à jour :

```bash
# Vérifier les changements majeurs
npm outdated

# Mettre à jour les patches
npm update

# Mettre à jour mineure/majeure
npm install <package>@latest
```

## Alternative aux dépendances

Si vous préférez d'autres librairies :

### Remplacer axios
- `fetch` API (natif, plus léger)
- `react-query` pour caching avancé
- `SWR` pour data fetching

### Remplacer Tailwind
- `styled-components`
- `emotion`
- `CSS Modules`

### Remplacer lucide-react
- `react-icons`
- `heroicons`
- Icônes custom SVG

### Remplacer TypeORM
- `Prisma` (plus moderne)
- `Sequelize`
- `Knex.js`

## Performance

### Frontend bundle size
Objectif: < 200 KB gzipped

```bash
npm run build
# Vérifier dist/index.html et dist/assets/
```

### Backend memory
Node.js 18 Alpine: ~50-100 MB au démarrage

## Licenses

- NestJS: MIT
- React: MIT
- Tailwind: MIT
- PostgreSQL: PostgreSQL License (très permissive)
- All npm packages: Varies (mostly MIT)

Vérifier les licenses : `npm list --depth=0` et consulter la licence de chaque package si nécessaire pour votre cas d'usage commercial.
