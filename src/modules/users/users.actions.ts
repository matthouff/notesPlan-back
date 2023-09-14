import { Logger, NotFoundException } from '@nestjs/common';
import { User } from './entity/users';
import { UserRepository } from './users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserActions {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) { }

  /**
   * Récupère un utilisateur par son identifiant.
   * @param id L'identifiant de l'utilisateur à récupérer.
   * @returns L'utilisateur récupéré.
   * @throws NotFoundException si aucun utilisateur n'est trouvé avec l'identifiant donné.
   */
  async getUserById(id: string): Promise<User> {
    const found = await this.userRepository.findByID(id);

    if (!found) {
      this.logger.debug(`Aucun User n'a été récupéré pour l'id "${id}"`);
      throw new NotFoundException(
        `Aucun User n'a été récupéré pour l'id "${id}"`,
      );
    }

    this.logger.debug(`Le User a été récupéré`);

    return found;
  }

  /**
   * Sauvegarde un utilisateur dans la base de données.
   * @param userEntity L'entité utilisateur à sauvegarder.
   * @returns L'utilisateur sauvegardé.
   */
  async saveUserToDatabase(userEntity: User): Promise<User> {
    const user = await this.userRepository.save(userEntity);

    this.logger.debug(`Le User a été sauvegardé dans la base de données`);

    return user;
  }
}
