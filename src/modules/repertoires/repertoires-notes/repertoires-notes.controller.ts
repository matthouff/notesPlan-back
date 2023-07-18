import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { EditRepertoireDto } from '../commun/dto/repertoires-edit.dto';
import { RepertoireDto } from '../commun/dto/repertoires.dto';
import { Repertoire } from '../commun/entity/repertoires';
import { IRepertoire } from '../commun/entity/repertoires.interface';
import { RepertoireNote } from './entity/repertoires-notes';
import { RepertoiresNotesService } from './repertoires-notes.service';

// http://localhost:3000
@Controller('repertoires_notes')
export class RepertoiresNotesController {
  constructor(readonly repertoiresService: RepertoiresNotesService) {}

  @Get()
  findAll(): Promise<IRepertoire[]> {
    return this.repertoiresService.findAll();
  }

  @Get('user/:userId')
  findAllByUserId(@Param('userId') userId: string) {
    return this.repertoiresService.findAllByUserId(userId);
  }

  @Post()
  create(@Body() repertoireDto: RepertoireNote) {
    return this.repertoiresService.create(repertoireDto);
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
