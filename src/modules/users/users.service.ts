import { Body, Injectable, Param } from '@nestjs/common';
import { CreateUserDto } from './dto/users-create.dto';
import { EditUserDto } from './dto/users-edit.dto';
import { User } from './entity/users';
import { IUser } from './entity/users.interface';
import { userRepository } from './users.repository';

@Injectable()
export class UsersService {

  constructor(readonly usersRepository: userRepository,) { }

  async findAll(): Promise<IUser[]> {
    return await this.usersRepository.getAll();
  }

  async create(data: User): Promise<User> {
    return await this.usersRepository.save(data);
  }

  async findById(id: string): Promise<User> {
    return await this.usersRepository.findByID(id);
  }

  async delete(id: string) {
    return await this.usersRepository.deleteByID(id);
  }

  async update(editUserDto: EditUserDto, id: string) {
    let user = await this.usersRepository.findByID(id);

    user.edit(editUserDto);

    return await this.usersRepository.save(user);
  }
}
