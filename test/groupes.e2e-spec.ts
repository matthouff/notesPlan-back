import { INestApplication } from '@nestjs/common';
import { ApiCall } from './api-call.class';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { addUserToDB, getUserConnected } from './mock/usersServiceMock';
import { closeTestAppConnexion, initializeTestApp } from './config/e2e.config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { IRepertoireResponse } from 'src/modules/repertoires/commun/entity/repertoires.interface';
import { addRepertoireGroupeToDB } from './mock/repertoiresGroupesServiceMock';
import { GroupeService } from 'src/modules/groupes/groupes.service';
import { CreateGroupeDto } from 'src/modules/groupes/dto/groupes-create.dto';
import {
  addGroupeToDB,
  createGroupeMock,
  updateGroupeMock,
} from './mock/groupeServiceMock';
import { IGroupeResponse } from 'src/modules/groupes/entity/groupes.interface';
import { EditGroupeDto } from 'src/modules/groupes/dto/groupes-edit.dto';

describe('GroupeController (e2e)', () => {
  let nestApp: INestApplication;
  let apiCall: ApiCall;
  let route = '/groupes';
  let baseUser: IUserResponse;
  let baseRepertoire: IRepertoireResponse;
  let app: INestApplication;
  let notesService: GroupeService;

  describe('POST', () => {
    beforeAll(async () => {
      nestApp = await initializeTestApp();
      baseUser = await addUserToDB({ nestApp });
      baseRepertoire = await addRepertoireGroupeToDB({ nestApp });
      apiCall = new ApiCall(nestApp);

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule], // Remplacez par le module principal de votre application
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // Obtenez une instance du service
      notesService = moduleFixture.get<GroupeService>(GroupeService);
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
        const createGroupeDto: CreateGroupeDto = createGroupeMock({
          repertoireId: baseRepertoire.id,
        });

        // Ajout à la bdd
        const response = await notesService.create({
          libelle: createGroupeDto.libelle,
          couleur: createGroupeDto.couleur,
          repertoireId: baseRepertoire.id,
        });

        expect(response.id).toBeDefined();
      });
    });
  });

  // PUT

  describe('PUT', () => {
    let baseGroupe: IGroupeResponse;

    beforeAll(async () => {
      nestApp = await initializeTestApp();
      baseGroupe = await addGroupeToDB({ nestApp: nestApp });
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
        const updateGroupeDto: EditGroupeDto = updateGroupeMock();

        const response = await apiCall.patch<EditGroupeDto>(
          route,
          baseGroupe.id,
          updateGroupeDto,
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
          const baseGroupe = await addGroupeToDB({
            nestApp: nestApp,
          });

          const response = await apiCall.get(route, baseGroupe.id);

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
          const baseEntity = await addGroupeToDB({ nestApp: nestApp });

          const response = await apiCall.delete(route, baseEntity.id);

          expect(response.status).toEqual(200);
        });
      });
    });
  });
});
