import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RepertoireGroupe } from '../repertoires/repertoires-groupes/entity/repertoires-groupes';
import { EditGroupeDto } from './dto/groupes-edit.dto';
import { Groupe } from './entity/groupes';
import { IGroupe } from './entity/groupes.interface';
import { GroupeService } from './groupes.service';


// http://localhost:3000
@Controller('groupes')
export class GroupeController {

  constructor(readonly groupesService: GroupeService,) { }

  @Get()
  findAll(): Promise<IGroupe[]> {
    return this.groupesService.findAll();
  }

  @Get("repertoire_groupe/:repertoireId")
  findAllByUserId(@Param('repertoireId') repertoireId: string) {
    return this.groupesService.findAllByRepertoireGroupeId(repertoireId);
  }

  @Post()
  create(@Body() repertoireDto: Groupe) {
    return this.groupesService.create(repertoireDto)
  }

  @Get(":id")
  findById(@Param() repertoire: IGroupe) {
    return this.groupesService.findById(repertoire.id)
  }

  @Delete(":id")
  delete(@Param() repertoire: IGroupe) {
    return this.groupesService.delete(repertoire.id)
  }

  @Patch(":id")
  update(@Body() repertoireDto: RepertoireGroupe, @Param() repertoire: IGroupe) {
    return this.groupesService.update(repertoireDto, repertoire.id)
  }

}
