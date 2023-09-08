import { INestApplication } from '@nestjs/common';
import { ApiCall } from './api-call.class';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { addUserToDB, getUserConnected } from './mock/usersServiceMock';
import { closeTestAppConnexion, initializeTestApp } from './config/e2e.config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { NoteService } from 'src/modules/notes/notes.service';
import { CreateNoteDto } from 'src/modules/notes/dto/notes-create.dto';
import { INoteResponse } from 'src/modules/notes/entity/notes.interface';
import { EditNoteDto } from 'src/modules/notes/dto/notes-edit.dto';
import {
  addNoteToDB,
  createNoteMock,
  updateNoteMock,
} from './mock/noteServiceMock';
import { IRepertoireResponse } from 'src/modules/repertoires/commun/entity/repertoires.interface';
import { addRepertoireNoteToDB } from './mock/repertoiresNotesServiceMock';

describe('NoteController (e2e)', () => {
  let nestApp: INestApplication;
  let apiCall: ApiCall;
  let route = '/notes';
  let baseUser: IUserResponse;
  let baseRepertoire: IRepertoireResponse;
  let app: INestApplication;
  let notesService: NoteService;

  describe('POST', () => {
    beforeAll(async () => {
      nestApp = await initializeTestApp();
      baseUser = await addUserToDB({ nestApp });
      baseRepertoire = await addRepertoireNoteToDB({ nestApp });
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

      it('200 - Should create successfully', async () => {
        // Récupération des fausses données
        const createNoteDto: CreateNoteDto = createNoteMock({
          repertoireId: baseRepertoire.id,
        });

        // Ajout à la bdd
        const response = await apiCall.post(route, createNoteDto);

        expect(response.status).toBe(201);
      });
    });
  });

  // PUT

  describe('PUT', () => {
    let baseNote: INoteResponse;

    beforeAll(async () => {
      nestApp = await initializeTestApp();
      baseNote = await addNoteToDB({ nestApp: nestApp });
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
        const updateNoteDto: EditNoteDto = updateNoteMock();

        const response = await apiCall.patch<EditNoteDto>(
          route,
          baseNote.id,
          updateNoteDto,
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
          const baseNote = await addNoteToDB({
            nestApp: nestApp,
          });

          const response = await apiCall.get(route, baseNote.id);

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
          const baseEntity = await addNoteToDB({ nestApp: nestApp });

          const response = await apiCall.delete(route, baseEntity.id);

          expect(response.status).toEqual(200);
        });
      });
    });
  });
});
