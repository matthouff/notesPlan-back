import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EditTacheDto } from './dto/taches-edit.dto';
import { Tache } from './entity/taches';
import { ITache } from './entity/taches.interface';
import { TacheService } from './taches.service';
import { CreateTacheDto } from './dto/taches-create.dto';
import { ILabel } from '../labels/entity/labels.interface';
import { Label } from '../labels/entity/labels';


// http://localhost:3000
@Controller('taches')
export class TacheController {

  constructor(readonly tachesService: TacheService) { }

  @Get()
  findAll(): Promise<ITache[]> {
    return this.tachesService.findAll();
  }

  @Get("/groupe/:id")
  findAllByGroupeId(@Param('id') id_groupe: string): Promise<ITache[]> {
    return this.tachesService.findAllByGroupeId(id_groupe);
  }

  @Post()
  create(@Body() tacheDto: CreateTacheDto) {
    return this.tachesService.create(tacheDto)
  }

  @Get(":id")
  findById(@Param() tache: ITache) {
    return this.tachesService.findById(tache.id)
  }

  @Delete(":id")
  delete(@Param() tache: ITache) {
    return this.tachesService.delete(tache.id)
  }

  @Patch(":id")
  update(@Body() tacheDto: EditTacheDto, @Param() tache: ITache) {
    return this.tachesService.update(tacheDto, tache.id)
  }
}
