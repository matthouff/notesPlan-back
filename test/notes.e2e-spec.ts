import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { NoteService } from 'src/modules/notes/notes.service';
import NotesServiceMock from './mock/noteServiceMock';

describe('notesNotesController (e2e)', () => {
  let app: INestApplication;
  let createdNoteId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: NoteService,
          useClass: NotesServiceMock, // Utilisez le mock du service des Notes
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/notes (GET) - should return all notes', async () => {
    return await request(app.getHttpServer()).get('/notes').expect(200).expect((response) => {
      const notes = response.body;
      expect(Array.isArray(notes)).toBe(true);
    });

  });

  it('/notes (POST) - should create a new Note', () => {
    const newNote = { no_libelle: 'New Note' };
    return request(app.getHttpServer())
      .post('/notes')
      .send(newNote)
      .expect(201)
      .expect((response) => {
        const createdNote = response.body;
        expect(createdNote.no_libelle).toBe(newNote.no_libelle);
        createdNoteId = createdNote.id;
      });
  });

  // Récupération d'une note à partir de l'id du premier répertoire
  it('/notes/repertoire/:id (GET) - should return notes by repertoire ID', async () => {
    const repertoire = await request(app.getHttpServer()).get('/repertoires_notes').expect(200).expect((response) => {
      const repertoires = response.body;
      expect(Array.isArray(repertoires)).toBe(true);
    });

    const id_repertoire = repertoire.body[0].id

    return await request(app.getHttpServer()).get(`/notes/repertoire/${id_repertoire}`).expect(200).expect((response) => {
      const notes = response.body;
      expect(Array.isArray(notes)).toBe(true);
    });
  });

  it('/notes/:id (GET) - should return a specific note', async () => {
    return await request(app.getHttpServer())
      .get(`/notes/${createdNoteId}`)
      .expect(200)
      .expect((response) => {
        const note = response.body;
        expect(note.id).toBe(createdNoteId);
      });
  });

  it('/notes/:id (PATCH) - should update a specific Note', () => {
    const updatedNote = { no_libelle: 'Nouvelle note' }; // Provide the necessary data for updating the Note

    return request(app.getHttpServer())
      .patch(`/notes/${createdNoteId}`)
      .send(updatedNote)
      .expect(200)
      .expect((response) => {
        const retrievedNote = response.body;
        expect(retrievedNote.id).toBe(createdNoteId);
        expect(retrievedNote.no_libelle).toBe(updatedNote.no_libelle);
      });
  });

  it('/notes/:id (DELETE) - should delete a specific Note', () => {
    return request(app.getHttpServer())
      .delete(`/notes/${createdNoteId}`)
      .expect(200);
  });
});
