FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json yarn.lock* package-lock.json* ./

# Installer les dépendances
RUN npm install --prefer-offline --no-audit --progress=false

# Copier le code source
COPY . .

# Builder l'application
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "run", "start"]
