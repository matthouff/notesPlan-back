import { INestApplication } from '@nestjs/common';
import { ApiCall } from './api-call.class';
import { closeTestAppConnexion, initializeTestApp } from './config/e2e.config';
import {
  addUserToDB,
  createUserMock,
  getUserConnected,
  getUserFromDB,
  updateUserMock,
} from './mock/usersServiceMock';
import { CreateUserDto } from 'src/modules/users/dto/users-create.dto';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { EditUserDto } from 'src/modules/users/dto/users-edit.dto';
import { AuthActions } from 'src/modules/auth/auth.actions';
import { jwtConstants } from 'src/modules/auth/constants';

describe('UsersControllerService (e2e)', () => {
  let apiCall: ApiCall;
  let nestApp: INestApplication;
  let route = '/users';

  // POST

  describe('POST', () => {
    beforeAll(async () => {
      nestApp = await initializeTestApp();
      apiCall = new ApiCall(nestApp);
    });

    afterAll(async () => {
      await closeTestAppConnexion(nestApp);
    });

    describe('CREATE', () => {
      it('400 - Should not accept empty body', async () => {
        const response = await apiCall.post('/auth/register', {});

        expect(response.status).toBe(400);
      });

      it('200 - Should create successfully', async () => {
        const createUserDto: CreateUserDto = createUserMock();

        const response = await apiCall.post<CreateUserDto>(
          '/auth/register',
          createUserDto,
        );

        expect(response.status).toBe(201);

        const { email, prenom, nom, password }: IUserResponse =
          response.body.data;

        expect(email).toEqual(createUserDto.email);
        expect(prenom).toEqual(createUserDto.prenom);
        expect(nom).toEqual(createUserDto.nom);
        expect(password).toEqual(createUserDto.password);
      });

      it('409 - Should not create successfully when the email is already used', async () => {
        const emailValues = [
          'tesT@email.com',
          'test@email.com',
          'TEST@EMAIL.COM',
        ];
        const emailValue = 'test@email.com';

        await addUserToDB({ nestApp, email: emailValue });

        for await (const email of emailValues) {
          const createUserDto: CreateUserDto = createUserMock({ email });

          const response = await apiCall.post<CreateUserDto>(
            '/auth/register',
            createUserDto,
          );

          expect(response.status).toBe(409);
        }
      });
    });
  });

  // PUT

  describe('PUT', () => {
    let baseUser: IUserResponse;

    beforeAll(async () => {
      nestApp = await initializeTestApp();

      baseUser = await addUserToDB({ nestApp });

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
        const updateUserDto: EditUserDto = updateUserMock();

        const response = await apiCall.patch<EditUserDto>(
          route,
          baseUser.id,
          updateUserDto,
        );

        expect(response.status).toBe(200);

        const { id, email, prenom, nom, password }: IUserResponse =
          await getUserFromDB({
            nestApp,
            id: baseUser.id,
          });

        expect(id).toBeDefined();
        expect(email).toBeDefined();
        expect(prenom).toEqual(updateUserDto.prenom);
        expect(nom).toEqual(updateUserDto.nom);
        expect(password).toEqual(password);
      });
    });
  });

  // GET

  describe('GET', () => {
    describe('FIND', () => {
      let baseUser: IUserResponse;

      beforeEach(async () => {
        nestApp = await initializeTestApp();

        baseUser = await addUserToDB({ nestApp });

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
          const response = await apiCall.get(route, baseUser.id);

          expect(response.status).toBe(200);

          const { id, email, prenom, nom, password }: IUserResponse =
            response.body;

          expect(id).toEqual(baseUser.id);
          expect(email).toBeDefined();
          expect(prenom).toBeDefined();
          expect(nom).toBeDefined();
          expect(password).toBeDefined();
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
          const baseEntity = await addUserToDB({ nestApp });

          const response = await apiCall.delete(route, baseEntity.id);

          expect(response.status).toEqual(200);
        });
      });
    });

    // LOGIN

    describe('LOGIN', () => {
      let baseUser: IUserResponse;
      let authActions: AuthActions;

      const password = 'MatMat';

      beforeEach(async () => {
        nestApp = await initializeTestApp();
        baseUser = await addUserToDB({ nestApp, password: password });

        apiCall = new ApiCall(nestApp);
      });

      afterEach(async () => {
        await closeTestAppConnexion(nestApp);
        await apiCall.post('/auth/logout');
      });

      describe(' (/login) ', () => {
        it('400 - Should not accept empty body', async () => {
          const response = await apiCall.post('/auth/login', {});

          expect(response.status).toBe(400);
        });

        it('200 - Should send back the entity', async () => {
          const response = await apiCall.post('/auth/login', {
            ...baseUser,
            password: password,
          });

          expect(response.status).toBe(200);

          const userId = await getUserConnected({ nestApp, response });
          const user = await getUserFromDB({ nestApp, id: userId })

          expect(user).toBeDefined()
        });
      });
    });
  });
});
