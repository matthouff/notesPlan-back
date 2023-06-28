import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EditTacheDto } from './dto/taches-edit.dto';
import { Tache } from './entity/taches';
import { ITache } from './entity/taches.interface';
import { TacheService } from './taches.service';


// http://localhost:3000
@Controller('taches')
export class TacheController {

  constructor(readonly tachesService: TacheService) { }

  @Get()
  findAll(): Promise<ITache[]> {
    return this.tachesService.findAll();
  }

  @Get("/tache/:id")
  findAllByGroupeId(@Param('id') id_groupe: string): Promise<ITache[]> {
    return this.tachesService.findAllByGroupeId(id_groupe);
  }

  @Post()
  create(@Body() repertoireDto: Tache) {
    return this.tachesService.create(repertoireDto)
  }

  @Get(":id")
  findById(@Param() repertoire: ITache) {
    return this.tachesService.findById(repertoire.id)
  }

  @Delete(":id")
  delete(@Param() repertoire: ITache) {
    return this.tachesService.delete(repertoire.id)
  }

  @Patch(":id")
  update(@Body() repertoireDto: EditTacheDto, @Param() repertoire: ITache) {
    return this.tachesService.update(repertoireDto, repertoire.id)
  }

}
