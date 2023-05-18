import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/users-create.dto';
import { EditUserDto } from './dto/users-edit.dto';
import { User } from './entity/users';
import { IUser } from './entity/users.interface';
import { UsersService } from './users.service';

// http://localhost:3000
@Controller('users')
export class UsersController {

  constructor(readonly usersService: UsersService,) { }

  @Get()
  findAll(): Promise<IUser[]> {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() userDto: User) {
    return this.usersService.create(userDto)
  }

  @Get(":id")
  findById(@Param() user: IUser) {
    return this.usersService.findById(user.id)
  }

  @Delete(":id")
  delete(@Param() user: IUser) {
    return this.usersService.delete(user.id)
  }

  @Patch(":id")
  update(@Body() userDto: EditUserDto, @Param() user: IUser) {
    return this.usersService.update(userDto, user.id)
  }

}
