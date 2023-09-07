import { INestApplication } from '@nestjs/common';
import { ApiCall } from './api-call.class';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { addUserToDB, getUserConnected } from './mock/usersServiceMock';
import { closeTestAppConnexion, initializeTestApp } from './config/e2e.config';
import { CreateRepertoireDto } from 'src/modules/repertoires/commun/dto/repertoires-create.dto';
import {
  addManyRepertoireNoteToDB,
  addRepertoireNoteToDB,
  createRepertoireNoteMock,
  getRepertoireNoteFromDB,
  updateRepertoireNoteMock,
} from './mock/repertoiresNotesServiceMock';
import {
  IRepertoireCreator,
  IRepertoireResponse,
} from 'src/modules/repertoires/commun/entity/repertoires.interface';
import { EditRepertoireDto } from 'src/modules/repertoires/commun/dto/repertoires-edit.dto';
import { RepertoiresNotesService } from 'src/modules/repertoires/repertoires-notes/repertoires-notes.service';
import { RepertoireNote } from 'src/modules/repertoires/repertoires-notes/entity/repertoires-notes';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';

describe('RepertoireController (e2e)', () => {
  let nestApp: INestApplication;
  let apiCall: ApiCall;
  let route = '/repertoires_notes';
  let baseUser: IUserResponse;
  let app: INestApplication;
  let repertoiresNotesService: RepertoiresNotesService;

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
      repertoiresNotesService = moduleFixture.get<RepertoiresNotesService>(
        RepertoiresNotesService,
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
          createRepertoireNoteMock({
            userId: baseUser.id,
          });

        // Ajout à la bdd
        const response = await repertoiresNotesService.create({
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
      baseRepertoire = await addRepertoireNoteToDB({ nestApp: nestApp });
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
          updateRepertoireNoteMock();

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
          const baseRepertoire = await addRepertoireNoteToDB({
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
          const baseEntity = await addRepertoireNoteToDB({ nestApp: nestApp });

          const response = await apiCall.delete(route, baseEntity.id);

          expect(response.status).toEqual(200);
        });
      });
    });
  });
});
