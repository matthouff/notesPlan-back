import { Injectable } from '@nestjs/common';
import { EditUserDto } from './dto/users-edit.dto';
import { User } from './entity/users';
import { IUser } from './entity/users.interface';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(readonly usersRepository: UserRepository) { }

  /**
   * Récupère tous les utilisateurs enregistrés.
   * @returns Une liste de tous les utilisateurs.
   */
  async findAll(): Promise<IUser[]> {
    return await this.usersRepository.getAll();
  }

  /**
   * Crée un nouvel utilisateur.
   * @param data Les données de l'utilisateur à créer.
   * @returns L'utilisateur créé.
   */
  async create(data: User): Promise<User> {
    return await this.usersRepository.save(data);
  }

  /**
   * Récupère un utilisateur par son identifiant.
   * @param id L'identifiant de l'utilisateur à rechercher.
   * @returns L'utilisateur correspondant à l'identifiant donné, s'il existe.
   */
  async findById(id: string): Promise<User> {
    return await this.usersRepository.findByID(id);
  }

  /**
   * Récupère un utilisateur par son adresse e-mail.
   * @param email L'adresse e-mail de l'utilisateur à rechercher.
   * @returns L'utilisateur correspondant à l'adresse e-mail donnée, s'il existe.
   */
  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOneByEmail(email);
  }

  /**
   * Supprime un utilisateur par son identifiant.
   * @param id L'identifiant de l'utilisateur à supprimer.
   * @returns Une promesse indiquant si la suppression a réussi.
   */
  async delete(id: string) {
    return await this.usersRepository.deleteByID(id);
  }

  /**
   * Met à jour les informations d'un utilisateur.
   * @param editUserDto Les données à mettre à jour pour l'utilisateur.
   * @param id L'identifiant de l'utilisateur à mettre à jour.
   * @returns L'utilisateur mis à jour.
   */
  async update(editUserDto: EditUserDto, id: string) {
    let user = await this.usersRepository.findByID(id);

    user.edit(editUserDto);

    return await this.usersRepository.save(user);
  }
}
