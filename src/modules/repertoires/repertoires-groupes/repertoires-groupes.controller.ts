import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EditRepertoireDto } from '../commun/dto/repertoires-edit.dto';
import { Repertoire } from '../commun/entity/repertoires';
import { IRepertoire } from '../commun/entity/repertoires.interface';
import { RepertoiresGroupesService } from './repertoires-groupes.service';


// http://localhost:3000
@Controller('repertoires_groupes')
export class RepertoiresGroupesController {

  constructor(readonly repertoiresService: RepertoiresGroupesService,) { }

  @Get()
  findAll(): Promise<IRepertoire[]> {
    return this.repertoiresService.findAll();
  }

  @Get("user/:id_user")
  findAllByUserId(@Param('id_user') id_user: string): Promise<IRepertoire[]> {
    return this.repertoiresService.findAllByUserId(id_user);
  }

  @Post()
  create(@Body() repertoireDto: Repertoire) {
    return this.repertoiresService.create(repertoireDto)
  }

  @Get(":id")
  findById(@Param() repertoire: IRepertoire) {
    return this.repertoiresService.findById(repertoire.id)
  }

  @Delete(":id")
  delete(@Param() repertoire: IRepertoire) {
    return this.repertoiresService.delete(repertoire.id)
  }

  @Patch(":id")
  update(@Body() repertoireDto: EditRepertoireDto, @Param() repertoire: IRepertoire) {
    return this.repertoiresService.update(repertoireDto, repertoire.id)
  }

}
