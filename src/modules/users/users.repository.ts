import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RepositoryStarter } from '../repository-starter.class';
import { User } from './entity/users';

@Injectable()
export class UserRepository extends RepositoryStarter<User> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(User));
  }

  /**
   * Recherche un utilisateur par son adresse e-mail.
   * @param email L'adresse e-mail de l'utilisateur à rechercher.
   * @returns L'utilisateur correspondant à l'adresse e-mail donnée, s'il existe.
   */
  async findOneByEmail(email: string) {
    return await this.model.findOneBy({ email });
  }

  /**
   * Recherche un utilisateur par son identifiant.
   * @param id L'identifiant de l'utilisateur à rechercher.
   * @returns L'utilisateur correspondant à l'identifiant donné, s'il existe.
   */
  async findOneById(id: string) {
    return await this.model.findOne({ where: { id } });
  }
}
