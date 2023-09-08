import { INestApplication } from '@nestjs/common';
import { ApiCall } from './api-call.class';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { addUserToDB } from './mock/usersServiceMock';
import { closeTestAppConnexion, initializeTestApp } from './config/e2e.config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { IRepertoireResponse } from 'src/modules/repertoires/commun/entity/repertoires.interface';
import { LabelService } from 'src/modules/labels/labels.service';
import { CreateLabelDto } from 'src/modules/labels/dto/labels-create.dto';
import { addRepertoireGroupeToDB } from './mock/repertoiresGroupesServiceMock';
import { addGroupeToDB } from './mock/groupeServiceMock';
import { IGroupeResponse } from 'src/modules/groupes/entity/groupes.interface';
import { addLabelToDB, createLabelMock } from './mock/labelServiceMock';
import { ITacheResponse } from 'src/modules/taches/entity/taches.interface';

describe('LabelController (e2e)', () => {
  let nestApp: INestApplication;
  let apiCall: ApiCall;
  let route = '/labels';
  let baseUser: IUserResponse;
  let baseRepertoire: IRepertoireResponse;
  let baseGroupe: IGroupeResponse;
  let app: INestApplication;
  let notesService: LabelService;

  describe('POST', () => {
    beforeAll(async () => {
      nestApp = await initializeTestApp();
      baseUser = await addUserToDB({ nestApp });
      baseRepertoire = await addRepertoireGroupeToDB({ nestApp });
      baseGroupe = await addGroupeToDB({ nestApp });
      apiCall = new ApiCall(nestApp);

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule], // Remplacez par le module principal de votre application
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // Obtenez une instance du service
      notesService = moduleFixture.get<LabelService>(LabelService);
    });

    afterAll(async () => {
      await closeTestAppConnexion(nestApp);
    });

    describe('CREATE', () => {
      it('400 - Should not accept empty body', async () => {
        const response = await apiCall.post(route, {});

        expect(response.status).toBe(400);
      });

      it('400 - Should not accept labels exceeding 25 characters', async () => {
        const createLabelDto: CreateLabelDto = createLabelMock({
          libelle: 'Ceci est un libelle supérieur à 25 caractères',
          repertoireId: baseRepertoire.id,
        });

        const response = await apiCall.post(route, createLabelDto);
        expect(response.status).toBe(400);
      });

      it('200 - Should create successfully', async () => {
        // Récupération des fausses données
        const createLabelDto: CreateLabelDto = createLabelMock({
          repertoireId: baseRepertoire.id,
        });

        // Ajout à la bdd
        const response = await apiCall.post(route, createLabelDto);
        expect(response.status).toBe(201);
      });
    });
  });

  // GET

  describe('GET', () => {
    describe('FIND', () => {
      beforeEach(async () => {
        nestApp = await initializeTestApp();
        apiCall = new ApiCall(nestApp);
      });

      afterEach(async () => {
        await closeTestAppConnexion(nestApp);
      });

      describe(' (/:id) ', () => {
        it('400 - Should not accept a value that is not a UUID', async () => {
          const values = ['23a42931-1cba-48a0-b72b', 5874];

          for await (const id of values) {
            const { status } = await apiCall.get(route, id);

            expect(status).toBe(400);
          }
        });

        it('200 - Should send back the entity', async () => {
          const baseLabel = await addLabelToDB({
            nestApp: nestApp,
          });

          const response = await apiCall.get(route, baseLabel.id);

          expect(response.status).toBe(200);
        });
      });
    });

    describe('DELETE', () => {
      beforeEach(async () => {
        nestApp = await initializeTestApp();

        apiCall = new ApiCall(nestApp);
      });

      afterEach(async () => {
        await closeTestAppConnexion(nestApp);
      });

      describe('(/:id)', () => {
        it('200 - Should delete the entity', async () => {
          const baseEntity = await addLabelToDB({ nestApp: nestApp });

          const response = await apiCall.delete(route, baseEntity.id);

          expect(response.status).toEqual(200);
        });
      });
    });
  });
});
