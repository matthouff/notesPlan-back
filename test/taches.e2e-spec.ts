import { INestApplication } from '@nestjs/common';
import { ApiCall } from './api-call.class';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { addUserToDB, getUserConnected } from './mock/usersServiceMock';
import { closeTestAppConnexion, initializeTestApp } from './config/e2e.config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { IRepertoireResponse } from 'src/modules/repertoires/commun/entity/repertoires.interface';
import { TacheService } from 'src/modules/taches/taches.service';
import { CreateTacheDto } from 'src/modules/taches/dto/taches-create.dto';
import { ITacheResponse } from 'src/modules/taches/entity/taches.interface';
import { EditTacheDto } from 'src/modules/taches/dto/taches-edit.dto';
import {
  addTacheToDB,
  createTacheMock,
  updateTacheMock,
} from './mock/tacheServiceMock';
import { addRepertoireGroupeToDB } from './mock/repertoiresGroupesServiceMock';
import { addGroupeToDB } from './mock/groupeServiceMock';
import { IGroupeResponse } from 'src/modules/groupes/entity/groupes.interface';

describe('TacheController (e2e)', () => {
  let nestApp: INestApplication;
  let apiCall: ApiCall;
  let route = '/taches';
  let baseUser: IUserResponse;
  let baseRepertoire: IRepertoireResponse;
  let baseGroupe: IGroupeResponse;
  let app: INestApplication;
  let notesService: TacheService;

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
      notesService = moduleFixture.get<TacheService>(TacheService);
    });

    afterAll(async () => {
      await closeTestAppConnexion(nestApp);
    });

    describe('CREATE', () => {
      it('400 - Should not accept empty body', async () => {
        const response = await apiCall.post(route, {});

        expect(response.status).toBe(400);
      });

      it('200 - Should create successfully', async () => {
        // Récupération des fausses données
        const createTacheDto: CreateTacheDto = createTacheMock({
          groupeId: baseRepertoire.id,
        });

        // Ajout à la bdd
        const response = await notesService.create({
          libelle: createTacheDto.libelle,
          detail: createTacheDto.detail,
          groupeId: baseGroupe.id,
        });

        expect(response.id).toBeDefined();
      });
    });
  });

  // PUT

  describe('PUT', () => {
    let baseTache: ITacheResponse;

    beforeAll(async () => {
      nestApp = await initializeTestApp();
      baseUser = await addUserToDB({ nestApp });
      baseRepertoire = await addRepertoireGroupeToDB({ nestApp });
      baseGroupe = await addGroupeToDB({ nestApp });
      baseTache = await addTacheToDB({ nestApp });
      apiCall = new ApiCall(nestApp);
    });

    afterAll(async () => {
      await closeTestAppConnexion(nestApp);
    });

    describe('UPDATE', () => {
      it('400 - Should not accept a value that is not a UUID', async () => {
        const values = ['23a42931-1cba-48a0-b72b', 5874];

        for await (const id of values) {
          const { status } = await apiCall.patch(route, id, {});

          expect(status).toBe(400);
        }
      });

      it('200 - Should update successfully', async () => {
        const updateTacheDto: EditTacheDto = updateTacheMock({
          groupeId: baseGroupe.id,
        });

        const response = await apiCall.patch<EditTacheDto>(
          route,
          baseTache.id,
          updateTacheDto,
        );

        expect(response.status).toBe(200);
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
          const baseTache = await addTacheToDB({
            nestApp: nestApp,
          });

          const response = await apiCall.get(route, baseTache.id);

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
          const baseEntity = await addTacheToDB({ nestApp: nestApp });

          const response = await apiCall.delete(route, baseEntity.id);

          expect(response.status).toEqual(200);
        });
      });
    });
  });
});
