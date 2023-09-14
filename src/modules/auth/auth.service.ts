import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/users-create.dto';
import { UserRepository } from '../users/users.repository';
import { User } from '../users/entity/users';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
  ) { }

  /**
   * Recherche un utilisateur par son adresse e-mail.
   *
   * @param condition La condition de recherche, généralement l'adresse e-mail de l'utilisateur.
   * @returns Une promesse qui résout avec l'utilisateur trouvé ou null s'il n'est pas trouvé.
   */
  async findOneByEmail(condition: any): Promise<User> {
    return this.userRepository.findOneByEmail(condition)
  }

  /**
   * Recherche un utilisateur par son identifiant (ID).
   *
   * @param id L'identifiant de l'utilisateur à rechercher.
   * @returns Une promesse qui résout avec l'utilisateur trouvé ou null s'il n'est pas trouvé.
   */
  async findOneById(id: any): Promise<User> {
    return this.userRepository.findByID(id)
  }

  /**
   * Enregistre un nouvel utilisateur dans la base de données.
   *
   * @param data Les données de l'utilisateur à enregistrer.
   * @returns Une promesse qui résout avec les données de l'utilisateur enregistré.
   */
  async register(data: any): Promise<CreateUserDto> {
    return this.userRepository.save(data)
  }
}
