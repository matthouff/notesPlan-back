import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/users-create.dto';
import { UserRepository } from '../users/users.repository';
import { promises } from 'dns';
import { User } from '../users/entity/users';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
  ) { }

  async findOneByEmail(condition: any): Promise<User> {
    return this.userRepository.findOneByEmail(condition)
  }
  async findOneById(id: any): Promise<User> {
    return this.userRepository.findByID(id)
  }

  async register(data: any): Promise<CreateUserDto> {
    return this.userRepository.save(data)
  }
}
