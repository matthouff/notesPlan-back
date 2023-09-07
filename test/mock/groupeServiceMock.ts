import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IRepertoireResponse } from 'src/modules/repertoires/commun/entity/repertoires.interface';
import { addRepertoireGroupeToDB } from './repertoiresGroupesServiceMock';
import { CreateGroupeDto } from 'src/modules/groupes/dto/groupes-create.dto';
import { EditGroupeDto } from 'src/modules/groupes/dto/groupes-edit.dto';
import { IGroupeResponse } from 'src/modules/groupes/entity/groupes.interface';
import { Groupe } from 'src/modules/groupes/entity/groupes';

/** Génère des fausses données destinés à la création */
export const createGroupeMock = ({
  repertoireId,
}: {
  repertoireId: string;
}): CreateGroupeDto => ({
  repertoireId,
  libelle: faker.company.name(),
});

/** Génère des fausses données destinés à la mise à jour */
export const updateGroupeMock = (): EditGroupeDto => ({
  libelle: faker.company.name(),
});

/** Insert dans la base de données avec de fausses données */
export async function addGroupeToDB({
  nestApp,
  repertoire,
}: {
  nestApp: INestApplication;
  repertoire?: IRepertoireResponse;
}): Promise<IGroupeResponse> {
  const repository = nestApp.get<Repository<Groupe>>('GroupeRepository');

  repertoire = repertoire ?? (await addRepertoireGroupeToDB({ nestApp }));

  const mockData = createGroupeMock({ repertoireId: repertoire.id });

  const GroupeCreator = {
    ...mockData,
    repertoire,
  };

  return await repository.save(GroupeCreator);
}

/** Insert plusieurs éléments dans la base de données avec de fausses données */
export async function addManyGroupeToDB({
  nestApp,
  numberOfRows,
  repertoire,
}: {
  nestApp: INestApplication;
  numberOfRows: number;
  repertoire?: IRepertoireResponse;
}): Promise<IGroupeResponse[]> {
  const promises: Promise<IGroupeResponse>[] = [];

  for (let i = 1; i <= numberOfRows; i += 1) {
    promises.push(addGroupeToDB({ nestApp, repertoire }));
  }

  return await Promise.all(promises);
}

/** Récupération d'un élément depuis la base de données */
export async function getGroupeFromDB({
  nestApp,
  id,
}: {
  nestApp: INestApplication;
  id: string;
}): Promise<IGroupeResponse> {
  const repository = nestApp.get<Repository<Groupe>>('GroupeRepository');

  return await repository.findOne({
    where: { id },
    relations: { repertoire: true },
  });
}
