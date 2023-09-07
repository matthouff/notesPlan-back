import { INestApplication } from '@nestjs/common';
import { ApiCall } from './api-call.class';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { addUserToDB } from './mock/usersServiceMock';
import { closeTestAppConnexion, initializeTestApp } from './config/e2e.config';
import { CreateRepertoireDto } from 'src/modules/repertoires/commun/dto/repertoires-create.dto';
import {
  addRepertoireGroupeToDB,
  createRepertoireGroupeMock,
  updateRepertoireGroupeMock,
} from './mock/repertoiresGroupesServiceMock';
import { IRepertoireResponse } from 'src/modules/repertoires/commun/entity/repertoires.interface';
import { EditRepertoireDto } from 'src/modules/repertoires/commun/dto/repertoires-edit.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { RepertoiresGroupesService } from 'src/modules/repertoires/repertoires-groupes/repertoires-groupes.service';

describe('RepertoireController (e2e)', () => {
  let nestApp: INestApplication;
  let apiCall: ApiCall;
  let route = '/repertoires_groupes';
  let baseUser: IUserResponse;
  let app: INestApplication;
  let repertoiresGroupesService: RepertoiresGroupesService;

  describe('POST', () => {
    beforeAll(async () => {
      nestApp = await initializeTestApp();
      baseUser = await addUserToDB({ nestApp });
      apiCall = new ApiCall(nestApp);

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule], // Remplacez par le module principal de votre application
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // Obtenez une instance du service
      repertoiresGroupesService = moduleFixture.get<RepertoiresGroupesService>(
        RepertoiresGroupesService,
      );
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
        const createRepertoireDto: CreateRepertoireDto =
          createRepertoireGroupeMock({
            userId: baseUser.id,
          });

        // Ajout à la bdd
        const response = await repertoiresGroupesService.create({
          libelle: createRepertoireDto.libelle,
          userId: baseUser.id,
        });

        expect(response.id).toBeDefined();
      });
    });
  });

  // PUT

  describe('PUT', () => {
    let baseRepertoire: IRepertoireResponse;

    beforeAll(async () => {
      nestApp = await initializeTestApp();
      baseRepertoire = await addRepertoireGroupeToDB({ nestApp: nestApp });
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
        const updateRepertoireDto: EditRepertoireDto =
          updateRepertoireGroupeMock();

        const response = await apiCall.patch<EditRepertoireDto>(
          route,
          baseRepertoire.id,
          updateRepertoireDto,
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
          const baseRepertoire = await addRepertoireGroupeToDB({
            nestApp: nestApp,
          });

          const response = await apiCall.get(route, baseRepertoire.id);

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
          const baseEntity = await addRepertoireGroupeToDB({
            nestApp: nestApp,
          });

          const response = await apiCall.delete(route, baseEntity.id);

          expect(response.status).toEqual(200);
        });
      });
    });
  });
});
