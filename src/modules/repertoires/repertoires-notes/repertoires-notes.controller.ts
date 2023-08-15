import {
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
import { RepertoiresNotesService } from './repertoires-notes.service';
import { CreateRepertoireDto } from '../commun/dto/repertoires-create.dto';
import { AuthActions } from 'src/modules/auth/auth.actions';
import { Request } from 'express';

// http://localhost:3000
@Controller('repertoires_notes')
export class RepertoiresNotesController {
  constructor(
    readonly repertoiresService: RepertoiresNotesService,
    readonly authActions: AuthActions,
  ) { }

  @Get()
  async findAllByUserId(@Req() request: Request) {
    try {
      const user = await this.authActions.getUser(request);
      return this.repertoiresService.findAllByUserId(user.id);
    } catch (error) {

    }
  }

  @Post()
  async create(@Body() repertoireDto: CreateRepertoireDto, @Req() request: Request) {
    const user = await this.authActions.getUser(request);
    return this.repertoiresService.create({ ...repertoireDto, userId: user.id });
  }

  @Get(':id')
  findById(@Param() repertoire: IRepertoire) {
    return this.repertoiresService.findById(repertoire.id);
  }

  @Delete(':id')
  delete(@Param() repertoire: IRepertoire) {
    return this.repertoiresService.delete(repertoire.id);
  }

  @Patch(':id')
  update(
    @Body() repertoireDto: EditRepertoireDto,
    @Param() repertoire: IRepertoire,
  ) {
    return this.repertoiresService.update(repertoireDto, repertoire.id);
  }
}
