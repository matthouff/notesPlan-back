import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RepertoireGroupe } from '../repertoires/repertoires-groupes/entity/repertoires-groupes';
import { IGroupe } from './entity/groupes.interface';
import { GroupeService } from './groupes.service';
import { CreateGroupeDto } from './dto/groupes-create.dto';
import { AuthGuard } from '../auth/auth.guard';

// http://127.0.0.1:3000
@Controller('groupes')
export class GroupeController {
  constructor(readonly groupesService: GroupeService) { }

  // Route pour récupérer tous les groupes
  @Get()
  findAll(): Promise<IGroupe[]> {
    return this.groupesService.findAll();
  }

  // Route pour récupérer tous les groupes d'un répertoire par son ID
  @Get('repertoire_groupe/:repertoireId')
  @UseGuards(AuthGuard)
  findAllByRepertoireId(@Param('repertoireId') repertoireId: string) {
    return this.groupesService.findAllByRepertoireGroupeId(repertoireId);
  }

  // Route pour créer un nouveau groupe
  @Post()
  async create(@Body() groupeDto: CreateGroupeDto) {
    try {
      if (!groupeDto.libelle) {
        throw new BadRequestException({
          message: 'Le libellé du groupe est manquant',
          type: 'error',
        });
      }

      await this.groupesService.create(groupeDto);

      return {
        message: 'Le groupe à bien été ajouté',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }

  // Route pour récupérer un groupe par son ID
  @Get(':id')
  async findById(@Param() repertoire: IGroupe) {
    try {
      return await this.groupesService.findById(repertoire.id);
    } catch (error) {
      throw new BadRequestException("Le groupe n'a pas été trouvé");
    }
  }

  // Route pour supprimer un groupe par son ID
  @Delete(':id')
  async delete(@Param() repertoire: IGroupe) {
    try {
      await this.groupesService.delete(repertoire.id);

      return {
        message: 'Le groupe à bien été supprimé',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({ message: 'Une erreur est survenue' });
    }
  }

  // Route pour mettre à jour un groupe par son ID
  @Patch(':id')
  async update(
    @Body() groupeDto: RepertoireGroupe,
    @Param() repertoire: IGroupe,
  ) {
    try {
      await this.groupesService.update(groupeDto, repertoire.id);

      return {
        message: 'Le groupe à bien été modifié',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({ message: 'Une erreur est survenue' });
    }
  }
}
