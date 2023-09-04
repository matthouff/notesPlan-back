import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EditTacheDto } from './dto/taches-edit.dto';
import { ITache } from './entity/taches.interface';
import { TacheService } from './taches.service';
import { CreateTacheDto } from './dto/taches-create.dto';

// http://127.0.0.1:3000
@Controller('taches')
export class TacheController {
  constructor(readonly tachesService: TacheService) {}

  @Get()
  findAll(): Promise<ITache[]> {
    return this.tachesService.findAll();
  }

  @Get('/groupe/:id')
  findAllByGroupeId(@Param('id') id_groupe: string): Promise<ITache[]> {
    return this.tachesService.findAllByGroupeId(id_groupe);
  }

  @Post()
  async create(@Body() tacheDto: CreateTacheDto) {
    try {
      await this.tachesService.create(tacheDto);

      return {
        message: 'La tache à bien été ajoutée',
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
  findById(@Param() tache: ITache) {
    return this.tachesService.findById(tache.id);
  }

  @Delete(':id')
  async delete(@Param() tache: ITache) {
    try {
      await this.tachesService.delete(tache.id);

      return {
        message: 'La tache à bien été supprimée',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }

  @Patch(':id')
  async update(@Body() tacheDto: EditTacheDto, @Param() tache: ITache) {
    try {
      await this.tachesService.update(tacheDto, tache.id);

      return {
        message: 'La tache à bien été modifiée',
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
