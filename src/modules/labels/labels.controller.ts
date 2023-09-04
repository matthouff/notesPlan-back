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
  constructor(readonly labelsService: LabelService) {}

  // @Get()
  // findAll(): Promise<ILabel[]> {
  //   return this.labelsService.findAll();
  // }

  @Get('/repertoire/:repertoireId')
  findAllLabelByRepertoireId(
    @Param('repertoireId') repertoireId: string,
  ): Promise<ILabel[]> {
    return this.labelsService.findAllLabelByRepertoireId(repertoireId);
  }

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

  @Get(':id')
  findById(@Param() repertoire: ILabel) {
    return this.labelsService.findById(repertoire.id);
  }

  @Get('/tache/:id')
  findAllByTacheId(@Param('id') tacheId: string): Promise<ILabel[]> {
    return this.labelsService.findAllByTacheId(tacheId);
  }

  @Delete(':id')
  delete(@Param() repertoire: ILabel) {
    return this.labelsService.delete(repertoire.id);
  }

  // Realation manyToMany taches / labels

  @Patch(':labelId/tache/:tacheId')
  AddLabelToTache(@Param('tacheId') tacheId: string, @Body() label: Label) {
    return this.labelsService.AddLabelToTache(tacheId, label.id);
  }

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
