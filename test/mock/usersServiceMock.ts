import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/users/dto/users-create.dto';
import { EditUserDto } from 'src/modules/users/dto/users-edit.dto';
import { User } from 'src/modules/users/entity/users';
import { IUserResponse } from 'src/modules/users/entity/users.interface';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from 'src/modules/auth/constants';
import * as jwt from 'jsonwebtoken'; // Importez jsonwebtoken

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
  password,
}: {
  nestApp: INestApplication;
  email?: string;
  password?: string;
}): Promise<IUserResponse> {
  const repository = nestApp.get<Repository<User>>('UserRepository');

  const mockData = createUserMock({
    email,
  });

  const userCreator = {
    ...mockData,
    prenom: mockData.prenom.charAt(0).toUpperCase() + mockData.prenom.slice(1),
    nom: mockData.nom.charAt(0).toUpperCase() + mockData.nom.slice(1),
    password: await bcrypt.hash(password ?? mockData.password, 12),
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
  const repository = nestApp.get<Repository<User>>('UserRepository');

  return await repository.findOne({ where: { id } });
}

/** Récupération d'un élément depuis la base de données */
export async function getUserConnected({
  nestApp,
  response,
}: {
  nestApp: INestApplication;
  response: any;
}) {
  const cookie = require('cookie');
  const headers = response.header;
  const cookies = cookie.parse(headers['set-cookie'].join('; '));
  const jwtToken = cookies.jwt;

  // Décodez le token JWT en utilisant jsonwebtoken
  const decodedToken = jwt.verify(jwtToken, jwtConstants.secret);
  return await getUserFromDB({ nestApp, id: decodedToken['id'].toString() });
}
