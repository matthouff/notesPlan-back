import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from 'src/modules/users/users.service';
import UsersServiceMock from './mock/usersServiceMock';

describe('UsersControllerService (e2e)', () => {
  let app: INestApplication;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: UsersService,
          useClass: UsersServiceMock, // Utilisez le mock du service des users
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET) - should return all users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((response) => {
        const users = response.body;
        expect(Array.isArray(users)).toBe(true);
      });
  });

  it('/users (POST) - should create a new user', () => {
    const newUser = { name: 'Bertholus', email: 'matth@example.com' };

    return request(app.getHttpServer())
      .post('/users')
      .send(newUser)
      .expect(201)
      .expect((response) => {
        const createdUser = response.body;
        expect(createdUser.name).toBe(newUser.name);
        expect(createdUser.email).toBe(newUser.email);
        userId = createdUser.id
      });
  });

  it('/users/:id (GET) - should return a specific user', () => {
    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200)
      .expect((response) => {
        const user = response.body;
        expect(user.id).toBe(userId);
      });
  });

  it('/users/:id (PATCH) - should update a specific user', () => {
    const updatedUser = { us_nom: 'Berthelot' };

    return request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send(updatedUser)
      .expect(200)
      .expect((response) => {
        const updatedUser = response.body;
        expect(updatedUser.id).toBe(userId);
        expect(updatedUser.us_nom).toBe(updatedUser.us_nom);
      });
  });

  it('/users/:id (DELETE) - should delete a specific user', () => {
    const currentUserId = userId;

    return request(app.getHttpServer())
      .delete(`/users/${currentUserId}`)
      .expect(200);
  });
});
