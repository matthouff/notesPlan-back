import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Utiliser Express
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // débloque la requête Cross-Origin (requête HTTP effectuée depuis un domaine, un protocole ou un port différent de celui de la ressource demandée)
  app.enableCors({
    origin: [
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ], // Remplacez true par l'URL ou les origines autorisées
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
