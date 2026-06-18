FROM node:18-alpine AS builder

WORKDIR /app

# Copier les dépendances
COPY package.json yarn.lock* package-lock.json* ./

# Installer les dépendances
RUN npm install --prefer-offline --no-audit --progress=false

# Copier le code
COPY . .

# Builder
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Installer un serveur HTTP simple
RUN npm install -g serve

# Copier les fichiers buildés
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 8080

# Démarrer l'application
CMD ["serve", "-s", "dist", "-l", "8080"]
