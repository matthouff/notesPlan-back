import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  // débloque la requête Cross-Origin (requête HTTP effectuée depuis un domaine, un protocole ou un port différent de celui de la ressource demandée)
  app.enableCors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:3000'], // Remplacez true par l'URL ou les origines autorisées
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  });
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
