import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { CreateRepertoireDto } from 'src/modules/repertoires/commun/dto/repertoires-create.dto';
import { EditRepertoireDto } from 'src/modules/repertoires/commun/dto/repertoires-edit.dto';
import { Repertoire } from 'src/modules/repertoires/commun/entity/repertoires';
import { IRepertoireResponse } from 'src/modules/repertoires/commun/entity/repertoires.interface';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { addUserToDB } from './usersServiceMock';
import { RepertoireNote } from 'src/modules/repertoires/repertoires-notes/entity/repertoires-notes';

/** Génère des fausses données destinés à la création */
export const createRepertoireNoteMock = ({
  userId,
}: {
  userId: string;
}): CreateRepertoireDto => ({
  userId,
  libelle: faker.company.name(),
});

/** Génère des fausses données destinés à la mise à jour */
export const updateRepertoireNoteMock = (data?: {
  userId?: string;
}): EditRepertoireDto => ({
  userId: data.userId,
  libelle: faker.company.name(),
});

/** Insert dans la base de données avec de fausses données */
export async function addRepertoireNoteToDB({
  nestApp,
  user,
}: {
  nestApp: INestApplication;
  user?: IUserResponse;
}): Promise<IRepertoireResponse> {
  const repository = nestApp.get<Repository<RepertoireNote>>(
    'RepertoireNoteRepository',
  );

  user = user ?? (await addUserToDB({ nestApp }));

  const mockData = createRepertoireNoteMock({ userId: user.id });

  const RepertoireCreator = {
    ...mockData,
    user,
  };

  return await repository.save(RepertoireCreator);
}

/** Insert plusieurs éléments dans la base de données avec de fausses données */
export async function addManyRepertoireNoteToDB({
  nestApp,
  numberOfRows,
  user,
}: {
  nestApp: INestApplication;
  numberOfRows: number;
  user?: IUserResponse;
}): Promise<IRepertoireResponse[]> {
  const promises: Promise<IRepertoireResponse>[] = [];

  for (let i = 1; i <= numberOfRows; i += 1) {
    promises.push(addRepertoireNoteToDB({ nestApp, user }));
  }

  return await Promise.all(promises);
}

/** Récupération d'un élément depuis la base de données */
export async function getRepertoireNoteFromDB({
  nestApp,
  id,
}: {
  nestApp: INestApplication;
  id: string;
}): Promise<IRepertoireResponse> {
  const repository = nestApp.get<Repository<RepertoireNote>>(
    'RepertoireRepository',
  );

  return await repository.findOne({ where: { id }, relations: { user: true } });
}
