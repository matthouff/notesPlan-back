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
  constructor(readonly groupesService: GroupeService) {}

  @Get()
  findAll(): Promise<IGroupe[]> {
    return this.groupesService.findAll();
  }

  @Get('repertoire_groupe/:repertoireId')
  @UseGuards(AuthGuard)
  findAllByRepertoireId(@Param('repertoireId') repertoireId: string) {
    return this.groupesService.findAllByRepertoireGroupeId(repertoireId);
  }

  @Post()
  async create(@Body() groupeDto: CreateGroupeDto) {
    try {
      const response = await this.groupesService.create(groupeDto);

      return {
        response,
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

  @Get(':id')
  async findById(@Param() repertoire: IGroupe) {
    try {
      return await this.groupesService.findById(repertoire.id);
    } catch (error) {
      throw new BadRequestException("Le groupe n'a pas été trouvé");
    }
  }

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
