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
  async findOneByEmail(email: string) {
    return await this.model.findOneBy({ email });
  }
  async findOneById(id: string) {
    return await this.model.findOne({ where: { id } });
  }
}
