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

  // cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM users WHERE nom = 'Berthelot') AS result;
  async findByNom(nom: string) {
    return await this.model.exist({ where: { nom } });
  }
}
