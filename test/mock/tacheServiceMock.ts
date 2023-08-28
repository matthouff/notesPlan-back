import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { IGroupeResponse } from "src/modules/groupes/entity/groupes.interface";
import { CreateTacheDto } from "src/modules/taches/dto/taches-create.dto";
import { EditTacheDto } from "src/modules/taches/dto/taches-edit.dto";
import { Tache } from "src/modules/taches/entity/taches";
import { ITacheResponse } from "src/modules/taches/entity/taches.interface";
import { Repository } from "typeorm";
import { addGroupeToDB } from "./groupeServiceMock";
import { Label } from "src/modules/labels/entity/labels";
import { ILabelResponse } from "src/modules/labels/entity/labels.interface";

/** Génère des fausses données destinés à la création */
export const createTacheMock = ({ groupeId }: { groupeId: string }): CreateTacheDto => ({
  groupeId,
  libelle: faker.company.name(),
  detail: faker.lorem.paragraphs()
});

/** Génère des fausses données destinés à la mise à jour */
export const updateTacheMock = (data?: { groupeId?: string }): EditTacheDto => ({
  groupeId: data.groupeId,
  libelle: faker.company.name(),
  detail: faker.lorem.paragraphs()
});

/** Insert dans la base de données avec de fausses données */
export async function addTacheToDB({
  nestApp,
  groupe,
  labels,
}: {
  nestApp: INestApplication;
  groupe?: IGroupeResponse;
  labels?: ILabelResponse;
}): Promise<ITacheResponse> {
  const repository = nestApp.get<Repository<Tache>>('TacheRepository');

  groupe = groupe ?? (await addGroupeToDB({ nestApp }));
  const mockData = createTacheMock({ groupeId: groupe.id });

  // Créez une nouvelle tâche avec les données et les labels fournis
  const TacheCreator = {
    ...mockData,
    groupe,
    labels,
  };

  return await repository.save(TacheCreator);
}


/** Insert plusieurs éléments dans la base de données avec de fausses données */
export async function addManyTacheToDB({
  nestApp,
  numberOfRows,
  groupe,
}: {
  nestApp: INestApplication;
  numberOfRows: number;
  groupe?: IGroupeResponse;
}): Promise<ITacheResponse[]> {
  const promises: Promise<ITacheResponse>[] = [];

  for (let i = 1; i <= numberOfRows; i += 1) {
    promises.push(addTacheToDB({ nestApp, groupe }));
  }

  return await Promise.all(promises);
}

/** Récupération d'un élément depuis la base de données */
export async function getTacheFromDB({
  nestApp,
  id,
}: {
  nestApp: INestApplication;
  id: string;
}): Promise<ITacheResponse> {
  const repository = nestApp.get<Repository<Tache>>("TacheRepository");

  return await repository.findOne({ where: { id }, relations: { groupe: true } });
}
