import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/users';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';
import { UserActions } from './users.actions';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule, UserActions],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, UserActions, Logger],
})
export class UsersModule {}
