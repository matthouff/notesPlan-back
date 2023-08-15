import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  // débloque la requête Cross-Origin (requête HTTP effectuée depuis un domaine, un protocole ou un port différent de celui de la ressource demandée)
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Remplacez true par l'URL ou les origines autorisées
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  });

  // Utiliser Express
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
