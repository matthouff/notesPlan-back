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
  constructor(readonly tachesService: TacheService) { }


  // Récupère toutes les tâches d'un groupe par son identifiant
  @Get('/groupe/:id')
  findAllByGroupeId(@Param('id') id_groupe: string): Promise<ITache[]> {
    return this.tachesService.findAllByGroupeId(id_groupe);
  }

  // Crée une nouvelle tâche
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

  // Récupère une tâche par son identifiant
  @Get(':id')
  async findById(@Param() tache: ITache) {
    try {
      return await this.tachesService.findById(tache.id);
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }

  // Supprime une tâche par son identifiant
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

  // Met à jour une tâche par son identifiant
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
