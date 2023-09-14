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
import { EditLabelDto } from './dto/labels-edit.dto';
import { Label } from './entity/labels';
import { ILabel } from './entity/labels.interface';
import { LabelService } from './labels.service';
import { CreateLabelDto } from './dto/labels-create.dto';

// http://127.0.0.1:3000
@Controller('labels')
export class LabelController {
  constructor(readonly labelsService: LabelService) { }

  // Endpoint pour récupérer tous les labels d'un répertoire spécifique
  @Get('/repertoire/:repertoireId')
  findAllLabelByRepertoireId(
    @Param('repertoireId') repertoireId: string,
  ): Promise<ILabel[]> {
    return this.labelsService.findAllLabelByRepertoireId(repertoireId);
  }

  // Endpoint pour créer un nouveau label
  @Post()
  async create(@Body() repertoireDto: CreateLabelDto) {
    if (!repertoireDto.couleur) {
      throw new BadRequestException({
        message: 'Veuillez saisir un libelle et une couleur',
        type: 'error',
      });
    }
    try {
      await this.labelsService.create(repertoireDto);

      return {
        message: 'Le label à bien été ajouté',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }

  // Endpoint pour récupérer un label par son ID
  @Get(':id')
  async findById(@Param() repertoire: ILabel) {
    try {
      return await this.labelsService.findById(repertoire.id);
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }

  // Endpoint pour récupérer tous les labels liés à une tâche spécifique
  @Get('/tache/:id')
  findAllByTacheId(@Param('id') tacheId: string): Promise<ILabel[]> {
    return this.labelsService.findAllByTacheId(tacheId);
  }

  // Endpoint pour supprimer un label par son ID
  @Delete(':id')
  delete(@Param() repertoire: ILabel) {
    return this.labelsService.delete(repertoire.id);
  }

  // Endpoint pour supprimer un label d'une tâche spécifique
  @Delete(':labelId/tache/:tacheId')
  async removeLabelFromTache(
    @Param('tacheId') tacheId: string,
    @Param('labelId') labelId: string,
  ) {
    try {
      await this.labelsService.removeLabelFromTache(labelId, tacheId);

      return {
        message: 'Le label à bien été supprimé',
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
