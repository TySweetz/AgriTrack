import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

/**
 * Point d'entrée de l'application NestJS
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadsDir = join(process.cwd(), 'uploads');
  const uploadsProductsDir = join(uploadsDir, 'products');

  [uploadsDir, uploadsProductsDir].forEach((dir) => {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  });

  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Activer CORS pour tous les domaines (V1 accepte *)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Préfixe global API
  app.setGlobalPrefix('');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application en écoute sur http://localhost:${port}`);
  console.log(`📚 API disponible sur http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Erreur lors du démarrage:', err);
  process.exit(1);
});
