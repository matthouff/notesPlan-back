import { INestApplication } from '@nestjs/common';
import { ApiCall } from './api-call.class';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { addUserToDB } from './mock/usersServiceMock';
import { closeTestAppConnexion, initializeTestApp } from './config/e2e.config';
import { CreateRepertoireDto } from 'src/modules/repertoires/commun/dto/repertoires-create.dto';
import {
  addManyRepertoireNoteToDB,
  addRepertoireNoteToDB,
  createRepertoireNoteMock,
  getRepertoireNoteFromDB,
  updateRepertoireNoteMock,
} from './mock/repertoiresNotesServiceMock';
import { IRepertoireResponse } from 'src/modules/repertoires/commun/entity/repertoires.interface';
import { EditRepertoireDto } from 'src/modules/repertoires/commun/dto/repertoires-edit.dto';

describe('RepertoireController (e2e)', () => {
  let nestApp: INestApplication;
  let apiCall: ApiCall;
  let route = '/repertoires_notes';
  let baseUser: IUserResponse;

  describe('POST', () => {
    beforeAll(async () => {
      nestApp = await initializeTestApp();
      baseUser = await addUserToDB({ nestApp });
      apiCall = new ApiCall(nestApp);
    });

    afterAll(async () => {
      await closeTestAppConnexion(nestApp);
    });

    describe('CREATE', () => {
      it('400 - Should not accept empty body', async () => {
        const response = await apiCall.post(route, {});

        expect(response.status).toBe(400);
      });

      it('200 - Should create successfully with mandatory values', async () => {
        const createRepertoireDto: CreateRepertoireDto =
          createRepertoireNoteMock({
            userId: baseUser.id,
          });

        const response = await apiCall.post<CreateRepertoireDto>(route, {
          libelle: createRepertoireDto.libelle,
          userId: baseUser.id,
        });

        console.log(createRepertoireDto);

        expect(response.status).toBe(201);

        const { id, user }: IRepertoireResponse = response.body;

        expect(id).toBeDefined();
        expect(user.id).toEqual(createRepertoireDto.userId);
      });

      it('200 - Should create successfully', async () => {
        const createRepertoireDto: CreateRepertoireDto =
          createRepertoireNoteMock({
            userId: baseUser.id,
          });

        const response = await apiCall.post<CreateRepertoireDto>(
          route,
          createRepertoireDto,
        );

        expect(response.status).toBe(201);

        const { id, user }: IRepertoireResponse = response.body;

        expect(id).toBeDefined();
        expect(user.id).toEqual(createRepertoireDto.userId);
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

        const { id, user }: IRepertoireResponse = await getRepertoireNoteFromDB(
          {
            nestApp: nestApp,
            id: baseRepertoire.id,
          },
        );

        expect(id).toBeDefined();
        expect(user).toBeDefined();
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

          const { id, user }: IRepertoireResponse = response.body;

          expect(id).toEqual(baseRepertoire.id);
          expect(user).toBeDefined();
        });
      });
    });

    describe('LIST', () => {
      beforeEach(async () => {
        nestApp = await initializeTestApp();

        apiCall = new ApiCall(nestApp);
      });

      afterEach(async () => {
        await closeTestAppConnexion(nestApp);
      });

      describe('(/user/:userId)', () => {
        it('200 - Should send back the list of entity with pagination informations by user', async () => {
          const [targeted, other] = await Promise.all([
            addUserToDB({ nestApp }),
            addUserToDB({ nestApp }),
          ]);

          await Promise.all([
            addManyRepertoireNoteToDB({
              nestApp: nestApp,
              numberOfRows: 14,
              user: targeted,
            }),
            addManyRepertoireNoteToDB({
              nestApp: nestApp,
              numberOfRows: 14,
              user: other,
            }),
          ]);

          const response = await apiCall.get(route, `user/${targeted.id}`);

          expect(response.status).toBe(200);
          expect(response.body.total).toEqual(14);
          expect(response.body.count).toEqual(14);
          expect(response.body.limit).toEqual(25);
          expect(response.body.offset).toEqual(0);
          expect(response.body.offsetMax).toEqual(0);
          expect(response.body.data.length).toEqual(14);

          response.body.data.forEach((member: IRepertoireResponse) => {
            const { id, user }: IRepertoireResponse = member;

            expect(id).toBeDefined();
            expect(user).toBeUndefined();
          });
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
