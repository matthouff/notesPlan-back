import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { EditRepertoireDto } from '../commun/dto/repertoires-edit.dto';
import { IRepertoire } from '../commun/entity/repertoires.interface';
import { RepertoiresGroupesService } from './repertoires-groupes.service';
import { CreateRepertoireDto } from '../commun/dto/repertoires-create.dto';
import { AuthActions } from 'src/modules/auth/auth.actions';
import { Request } from 'express';

// http://127.0.0.1:3000
@Controller('repertoires_groupes')
export class RepertoiresGroupesController {
  constructor(
    readonly repertoiresService: RepertoiresGroupesService,
    readonly authActions: AuthActions,
  ) {}

  // @Get()
  // findAll(): Promise<IRepertoire[]> {
  //   return this.repertoiresService.findAll();
  // }

  @Get()
  async findAllByUserId(@Req() request: Request) {
    try {
      const user = await this.authActions.getUser(request);
      return this.repertoiresService.findAllByUserId(user.id);
    } catch (error) {}
  }

  @Post()
  async create(
    @Body() repertoireDto: CreateRepertoireDto,
    @Req() request: Request,
  ) {
    try {
      const user = await this.authActions.getUser(request);
      await this.repertoiresService.create({
        ...repertoireDto,
        userId: user.id,
      });

      return {
        message: 'Le repertoire à bien été ajouté',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }

  @Get(':id')
  findById(@Param() repertoire: IRepertoire) {
    return this.repertoiresService.findById(repertoire.id);
  }

  @Delete(':id')
  async delete(@Param() repertoire: IRepertoire) {
    try {
      await this.repertoiresService.delete(repertoire.id);

      return {
        message: 'Le répertoire à bien été supprimé',
        type: 'success',
      };
    } catch (error) {}
    throw new BadRequestException({
      message: 'Une erreur est survenue',
      type: 'error',
    });
  }

  @Patch(':id')
  async update(
    @Body() repertoireDto: EditRepertoireDto,
    @Param() repertoire: IRepertoire,
  ) {
    try {
      await this.repertoiresService.update(repertoireDto, repertoire.id);

      return {
        message: 'Le répertoire à bien été modifié',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }
}
