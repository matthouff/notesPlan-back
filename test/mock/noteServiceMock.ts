import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { Repository } from 'typeorm';
import { Note } from 'src/modules/notes/entity/notes';
import { CreateNoteDto } from 'src/modules/notes/dto/notes-create.dto';
import { EditNoteDto } from 'src/modules/notes/dto/notes-edit.dto';
import { INoteResponse } from 'src/modules/notes/entity/notes.interface';
import { IRepertoireResponse } from 'src/modules/repertoires/commun/entity/repertoires.interface';
import { addRepertoireNoteToDB } from './repertoiresNotesServiceMock';

/** Génère des fausses données destinés à la création */
export const createNoteMock = ({
  repertoireId,
}: {
  repertoireId: string;
}): CreateNoteDto => ({
  repertoireId,
  libelle: faker.company.name(),
  message: faker.lorem.paragraphs(),
});

/** Génère des fausses données destinés à la mise à jour */
export const updateNoteMock = (): EditNoteDto => ({
  libelle: faker.company.name(),
  message: faker.lorem.paragraphs(),
});

/** Insert dans la base de données avec de fausses données */
export async function addNoteToDB({
  nestApp,
  repertoire,
}: {
  nestApp: INestApplication;
  repertoire?: IRepertoireResponse;
}): Promise<INoteResponse> {
  const repository = nestApp.get<Repository<Note>>('NoteRepository');

  repertoire = repertoire ?? (await addRepertoireNoteToDB({ nestApp }));

  const mockData = createNoteMock({ repertoireId: repertoire.id });

  const NoteCreator = {
    ...mockData,
    repertoire,
  };

  return await repository.save(NoteCreator);
}

/** Insert plusieurs éléments dans la base de données avec de fausses données */
export async function addManyNoteToDB({
  nestApp,
  numberOfRows,
  repertoire,
}: {
  nestApp: INestApplication;
  numberOfRows: number;
  repertoire?: IRepertoireResponse;
}): Promise<INoteResponse[]> {
  const promises: Promise<INoteResponse>[] = [];

  for (let i = 1; i <= numberOfRows; i += 1) {
    promises.push(addNoteToDB({ nestApp, repertoire }));
  }

  return await Promise.all(promises);
}

/** Récupération d'un élément depuis la base de données */
export async function getNoteFromDB({
  nestApp,
  id,
}: {
  nestApp: INestApplication;
  id: string;
}): Promise<INoteResponse> {
  const repository = nestApp.get<Repository<Note>>('NoteRepository');

  return await repository.findOne({
    where: { id },
    relations: { repertoire: true },
  });
}
