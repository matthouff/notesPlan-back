import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TacheService } from 'src/modules/taches/taches.service';
import TachesServiceMock from './mock/tacheServiceMock';

describe('tachesController (e2e)', () => {
  let app: INestApplication;
  let createdTacheId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: TacheService,
          useClass: TachesServiceMock, // Utilisez le mock du service des taches
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/taches (GET) - should return all taches', async () => {
    return await request(app.getHttpServer()).get('/taches').expect(200).expect((response) => {
      const taches = response.body;
      expect(Array.isArray(taches)).toBe(true);
    });

  });

  it('/taches (POST) - should create a new tache', () => {
    const newTache = { ta_libelle: 'New tache' };
    return request(app.getHttpServer())
      .post('/taches')
      .send(newTache)
      .expect(201)
      .expect((response) => {
        const createdTache = response.body;
        expect(createdTache.ta_libelle).toBe(newTache.ta_libelle);
        createdTacheId = createdTache.id;
      });
  });

  // Récupération d'une tache à partir de l'id du premier répertoire
  it('/taches/groupe/:id (GET) - should return taches by groupe ID', async () => {
    const groupe = await request(app.getHttpServer()).get('/groupes').expect(200).expect((response) => {
      const groupes = response.body;
      expect(Array.isArray(groupes)).toBe(true);
    });

    const id_groupe = groupe.body[0].id

    return await request(app.getHttpServer()).get(`/taches/groupe/${id_groupe}`).expect(200).expect((response) => {
      const taches = response.body;
      expect(Array.isArray(taches)).toBe(true);
    });
  });

  it('/taches/:id (GET) - should return a specific tache', async () => {
    return await request(app.getHttpServer())
      .get(`/taches/${createdTacheId}`)
      .expect(200)
      .expect((response) => {
        const tache = response.body;
        expect(tache.id).toBe(createdTacheId);
      });
  });

  it('/taches/:id (PATCH) - should update a specific tache', () => {
    const updatedtache = { ta_libelle: 'Nouvelle tache' }; // Provide the necessary data for updating the tache

    return request(app.getHttpServer())
      .patch(`/taches/${createdTacheId}`)
      .send(updatedtache)
      .expect(200)
      .expect((response) => {
        const retrievedtache = response.body;
        expect(retrievedtache.id).toBe(createdTacheId);
        expect(retrievedtache.ta_libelle).toBe(updatedtache.ta_libelle);
      });
  });

  it('/taches/:id (DELETE) - should delete a specific tache', () => {
    return request(app.getHttpServer())
      .delete(`/taches/${createdTacheId}`)
      .expect(200);
  });
});
