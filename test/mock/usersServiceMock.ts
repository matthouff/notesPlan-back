import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { CreateUserDto } from "src/modules/users/dto/users-create.dto";
import { EditUserDto } from "src/modules/users/dto/users-edit.dto";
import { User } from "src/modules/users/entity/users";
import { IUserResponse } from "src/modules/users/entity/users.interface";
import { Repository } from "typeorm";

/** Génère des fausses données destinés à la création */
export const createUserMock = (data?: { email?: string }): CreateUserDto => ({
  nom: faker.person.lastName(),
  prenom: faker.person.firstName(),
  email: data?.email ?? faker.internet.email(),
  password: faker.internet.password(),
});

/** Génère des fausses données destinés à la mise à jour */
export const updateUserMock = (): EditUserDto => ({
  nom: faker.person.lastName(),
  prenom: faker.person.firstName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

/** Insert dans la base de données avec de fausses données */
export async function addUserToDB({
  nestApp,
  email,
}: {
  nestApp: INestApplication;
  email?: string;
}): Promise<IUserResponse> {
  const repository = nestApp.get<Repository<User>>("UserRepository");

  const mockData = createUserMock({
    email,
  });

  const userCreator = {
    ...mockData,
    prenom: mockData.prenom.charAt(0).toUpperCase() + mockData.prenom.slice(1),
    nom: mockData.nom.charAt(0).toUpperCase() + mockData.nom.slice(1),
  };

  return await repository.save(userCreator);
}

/** Insert plusieurs éléments dans la base de données avec de fausses données */
export async function addManyUserToDB({
  nestApp,
  numberOfRows,
}: {
  nestApp: INestApplication;
  numberOfRows: number;
}): Promise<IUserResponse[]> {
  const promises: Promise<IUserResponse>[] = [];

  for (let i = 1; i <= numberOfRows; i += 1) {
    promises.push(addUserToDB({ nestApp }));
  }

  return await Promise.all(promises);
}

/** Récupération d'un élément depuis la base de données */
export async function getUserFromDB({
  nestApp,
  id,
}: {
  nestApp: INestApplication;
  id: string;
}): Promise<IUserResponse> {
  const repository = nestApp.get<Repository<User>>("UserRepository");

  return await repository.findOne({ where: { id } });
}