import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // débloque la requête Cross-Origin (requête HTTP effectuée depuis un domaine, un protocole ou un port différent de celui de la ressource demandée)
  const corsOptions: CorsOptions = {
    origin: true, // Remplacez true par l'URL ou les origines autorisées
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));

  await app.listen(3000);
}
bootstrap();
