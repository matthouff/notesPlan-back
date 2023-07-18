import { Logger, NotFoundException } from '@nestjs/common';
import { User } from './entity/users';
import { UserRepository } from './users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserActions {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  //
  // Update le User ciblé avec User et IUserEditor passé en paramettre
  //
  // updateUserValidation(User: User, updateUserDto: IUserEditor): User {
  // 	const data: IUserEditor = {
  // 		...updateUserDto,
  // 	};

  // 	User.edit(data);

  // 	this.logger.debug(`Le User a été mis à jour`);

  // 	return User;
  // }

  // On récupère le User avec l'id passé en parametre

  async getUserById(id: string): Promise<User> {
    const found = await this.userRepository.findByID(id);

    console.log(found);

    if (!found) {
      this.logger.debug(`Aucun User n'a été récupéré pour l'id "${id}"`);
      throw new NotFoundException(
        `Aucun User n'a été récupéré pour l'id "${id}"`,
      );
    }

    this.logger.debug(`Le User a été récupéré`);

    return found;
  }

  // async removeUserById(id: string): Promise<boolean> {
  // 	const deleted = await this.UserRepository.deleteByID(id);

  // 	this.logger.debug(`Le User a été supprimé`);

  // 	return deleted;
  // }

  async saveUserToDatabase(userEntity: User): Promise<User> {
    const user = await this.userRepository.save(userEntity);

    this.logger.debug(`Le User a été sauvegardé dans la base de données`);

    return user;
  }
}
