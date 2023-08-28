import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { ITacheResponse } from "src/modules/taches/entity/taches.interface";
import { Repository } from "typeorm";
import { addManyTacheToDB, addTacheToDB } from "./tacheServiceMock";
import { CreateLabelDto } from "src/modules/labels/dto/labels-create.dto";
import { EditLabelDto } from "src/modules/labels/dto/labels-edit.dto";
import { ILabelResponse } from "src/modules/labels/entity/labels.interface";
import { Label } from "src/modules/labels/entity/labels";
import { IRepertoireResponse } from "src/modules/repertoires/commun/entity/repertoires.interface";
import { addRepertoireGroupeToDB } from "./repertoiresGroupesServiceMock";

/** Génère des fausses données destinés à la création */
export const createLabelMock = ({ tacheId, repertoireId }: { tacheId?: string[], repertoireId: string }): CreateLabelDto => ({
  tacheId,
  repertoireId,
  libelle: faker.company.name(),
  couleur: faker.color.rgb(),
});

/** Génère des fausses données destinés à la mise à jour */
export const updateLabelMock = (data?: { tacheId: string[], repertoireId: string }): EditLabelDto => ({
  tacheId: data.tacheId,
  repertoireId: data.repertoireId,
  libelle: faker.company.name(),
  couleur: faker.color.rgb(),
});

/** Insert dans la base de données avec de fausses données */
export async function addLabelToDB({
  nestApp,
  inTache,
  repertoire,
}: {
  nestApp: INestApplication;
  inTache?: ITacheResponse[];
  repertoire?: IRepertoireResponse;
}): Promise<ILabelResponse> {
  const repository = nestApp.get<Repository<Label>>("LabelRepository");

  inTache = inTache ?? (await addManyTacheToDB({ nestApp, numberOfRows: 4 }));
  repertoire = repertoire ?? (await addRepertoireGroupeToDB({ nestApp }));

  const mockData = createLabelMock({ repertoireId: repertoire.id });

  const LabelCreator = {
    ...mockData,
    repertoire,
  };

  return await repository.save(LabelCreator);
}

/** Insert plusieurs éléments dans la base de données avec de fausses données */
export async function addManyLabelToDB({
  nestApp,
  numberOfRows,
}: {
  nestApp: INestApplication;
  numberOfRows: number;
  tache?: ITacheResponse[];
}): Promise<ILabelResponse[]> {
  const promises: Promise<ILabelResponse>[] = [];

  for (let i = 1; i <= numberOfRows; i += 1) {
    promises.push(addLabelToDB({ nestApp }));
  }

  return await Promise.all(promises);
}

/** Récupération d'un élément depuis la base de données */
export async function getLabelFromDB({
  nestApp,
  id,
}: {
  nestApp: INestApplication;
  id: string;
}): Promise<ILabelResponse> {
  const repository = nestApp.get<Repository<Label>>("LabelRepository");

  return await repository.findOne({ where: { id }, relations: { tache: true } });
}
