import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RepertoiresNotesService } from 'src/modules/repertoires/repertoires-notes/repertoires-notes.service';
import { response } from 'express';
import RepertoiresServiceMock from './mock/repertoiresServiceMock';

describe('RepertoiresNotesController (e2e)', () => {
  let app: INestApplication;
  let createdRepertoireId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: RepertoiresNotesService,
          useClass: RepertoiresServiceMock, // Utilisez le mock du service des users
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/repertoires_notes (GET) - should return all repertoires', async () => {
    return await request(app.getHttpServer()).get('/repertoires_notes').expect(200).expect((response) => {
      const repertoires = response.body;
      expect(Array.isArray(repertoires)).toBe(true);
    });
  });

  it('/repertoires_notes (POST) - should create a new repertoire', () => {
    const newRepertoire = { libelle: 'New Repertoire' };
    return request(app.getHttpServer())
      .post('/repertoires_notes')
      .send(newRepertoire)
      .expect(201)
      .expect((response) => {
        const createdRepertoire = response.body;
        expect(createdRepertoire.libelle).toBe(newRepertoire.libelle);
        createdRepertoireId = createdRepertoire.id;
      });
  });

  it('/repertoires_notes/user/:id (GET) - should return repertoires by user ID', async () => {
    let userId: String;
    const test = await request(app.getHttpServer()) // Crécupération des user pour récupérer le premier id
      .get('/users');

    userId = test.body[0].id

    return await request(app.getHttpServer()).get(`/repertoires_notes/user/${userId}`).expect(200).expect((response) => {
      const repertoires = response.body;
      expect(Array.isArray(repertoires)).toBe(true);
    });
  });

  it('/repertoires_notes/:id (GET) - should return a specific repertoire', async () => {
    return await request(app.getHttpServer())
      .get(`/repertoires_notes/${createdRepertoireId}`)
      .expect(200)
      .expect((response) => {
        const repertoire = response.body;
        expect(repertoire.id).toBe(createdRepertoireId);
      });
  });

  it('/repertoires_notes/:id (PATCH) - should update a specific repertoire', () => {
    const updatedRepertoire = { libelle: 'Nouveau répertoire' }; // Provide the necessary data for updating the repertoire

    return request(app.getHttpServer())
      .patch(`/repertoires_notes/${createdRepertoireId}`)
      .send(updatedRepertoire)
      .expect(200)
      .expect((response) => {
        const retrievedRepertoire = response.body;
        expect(retrievedRepertoire.id).toBe(createdRepertoireId);
        expect(retrievedRepertoire.libelle).toBe(updatedRepertoire.libelle);
      });
  });

  it('/repertoires_notes/:id (DELETE) - should delete a specific repertoire', () => {
    return request(app.getHttpServer())
      .delete(`/repertoires_notes/${createdRepertoireId}`)
      .expect(200);
  });
});
