import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EditUserDto } from './dto/users-edit.dto';
import { User } from './entity/users';
import { IUser } from './entity/users.interface';
import { UsersService } from './users.service';

// http://127.0.0.1:3000
@Controller('users')
export class UsersController {
  constructor(readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<IUser[]> {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() userDto: User) {
    return this.usersService.create(userDto);
  }

  @Get(':id')
  async findById(@Param() user: IUser) {
    try {
      return await this.usersService.findById(user.id);
    } catch (error) {
      throw new BadRequestException('Les données sont invalides');
    }
  }

  @Delete(':id')
  delete(@Param() user: IUser) {
    return this.usersService.delete(user.id);
  }

  @Patch(':id')
  async update(@Body() userDto: EditUserDto, @Param() user: IUser) {
    try {
      return await this.usersService.update(userDto, user.id);
    } catch (error) {
      throw new BadRequestException('Les données sont invalides');
    }
  }
}
