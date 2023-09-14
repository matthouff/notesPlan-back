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
  UseGuards,
} from '@nestjs/common';
import { EditRepertoireDto } from '../commun/dto/repertoires-edit.dto';
import { IRepertoire } from '../commun/entity/repertoires.interface';
import { RepertoiresNotesService } from './repertoires-notes.service';
import { CreateRepertoireDto } from '../commun/dto/repertoires-create.dto';
import { AuthActions } from 'src/modules/auth/auth.actions';
import { Request } from 'express';

// http://127.0.0.1:3000
@Controller('repertoires_notes')
export class RepertoiresNotesController {
  constructor(
    readonly repertoiresService: RepertoiresNotesService,
    readonly authActions: AuthActions,
  ) { }

  /**
   * Récupère tous les répertoires de notes d'un utilisateur.
   */
  @Get()
  async findAllByUserId(@Req() request: Request) {
    const token = request.cookies['jwt'];
    try {
      const user = await this.authActions.getUser(token);
      return await this.repertoiresService.findAllByUserId(user.id);
    } catch (error) { }
  }

  /**
   * Crée un nouveau répertoire de notes pour un utilisateur.
   */
  @Post()
  async create(
    @Body() repertoireDto: CreateRepertoireDto,
    @Req() request: Request,
  ) {
    try {
      const token = request.cookies['jwt'];
      const user = await this.authActions.getUser(token);
      await this.repertoiresService.create({
        ...repertoireDto,
        userId: user.id,
      });

      return {
        message: 'Le répertoire à bien été ajouté',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }

  /**
   * Récupère un répertoire de notes par son identifiant.
   */
  @Get(':id')
  async findById(@Param() repertoire: IRepertoire) {
    try {
      return await this.repertoiresService.findById(repertoire.id);
    } catch (error) {
      throw new BadRequestException("Le répertoire n'a pas été trouvé");
    }
  }

  /**
   * Supprime un répertoire de notes par son identifiant.
   */
  @Delete(':id')
  async delete(@Param() repertoire: IRepertoire) {
    try {
      await this.repertoiresService.delete(repertoire.id);

      return {
        message: 'Le répertoire à bien été supprimé',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }

  /**
   * Met à jour un répertoire de notes par son identifiant.
   */
  @Patch(':id')
  async update(
    @Body() repertoireDto: EditRepertoireDto,
    @Param() repertoire: IRepertoire,
  ) {
    try {
      await this.repertoiresService.update(repertoireDto, repertoire.id);

      return {
        message: 'Le repertoire à bien été modifié',
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
