import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GroupeService } from 'src/modules/groupes/groupes.service';
import GroupesServiceMock from './mock/groupeServiceMock';

describe('RepertoiresgroupesController (e2e)', () => {
  let app: INestApplication;
  let createdRepertoireId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: GroupeService,
          useClass: GroupesServiceMock, // Utilisez le mock du service des users
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/repertoires_groupes (GET) - should return all repertoires', async () => {
    return await request(app.getHttpServer()).get('/repertoires_groupes').expect(200).expect((response) => {
      const repertoires = response.body;
      expect(Array.isArray(repertoires)).toBe(true);
    });
  });

  it('/repertoires_groupes (POST) - should create a new repertoire', () => {
    const newRepertoire = { libelle: 'New Repertoire' };
    return request(app.getHttpServer())
      .post('/repertoires_groupes')
      .send(newRepertoire)
      .expect(201)
      .expect((response) => {
        const createdRepertoire = response.body;
        expect(createdRepertoire.libelle).toBe(newRepertoire.libelle);
        createdRepertoireId = createdRepertoire.id;
      });
  });

  it('/repertoires_groupes/user/:id (GET) - should return repertoires by user ID', async () => {
    let id_user: String;
    const test = await request(app.getHttpServer()) // Crécupération des user pour récupérer le premier id
      .get('/users');

    id_user = test.body[0].id

    return await request(app.getHttpServer()).get(`/repertoires_groupes/user/${id_user}`).expect(200).expect((response) => {
      const repertoires = response.body;
      expect(Array.isArray(repertoires)).toBe(true);
    });
  });

  it('/repertoires_groupes/:id (GET) - should return a specific repertoire', async () => {
    return await request(app.getHttpServer())
      .get(`/repertoires_groupes/${createdRepertoireId}`)
      .expect(200)
      .expect((response) => {
        const repertoire = response.body;
        expect(repertoire.id).toBe(createdRepertoireId);
      });
  });

  it('/repertoires_groupes/:id (PATCH) - should update a specific repertoire', () => {
    const updatedRepertoire = { libelle: 'Nouveau répertoire' }; // Provide the necessary data for updating the repertoire

    return request(app.getHttpServer())
      .patch(`/repertoires_groupes/${createdRepertoireId}`)
      .send(updatedRepertoire)
      .expect(200)
      .expect((response) => {
        const retrievedRepertoire = response.body;
        expect(retrievedRepertoire.id).toBe(createdRepertoireId);
        expect(retrievedRepertoire.libelle).toBe(updatedRepertoire.libelle);
      });
  });

  it('/repertoires_groupes/:id (DELETE) - should delete a specific repertoire', () => {
    return request(app.getHttpServer())
      .delete(`/repertoires_groupes/${createdRepertoireId}`)
      .expect(200);
  });
});
