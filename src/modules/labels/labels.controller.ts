import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EditLabelDto } from './dto/labels-edit.dto';
import { Label } from './entity/labels';
import { ILabel } from './entity/labels.interface';
import { LabelService } from './labels.service';
import { CreateLabelDto } from './dto/labels-create.dto';


// http://localhost:3000
@Controller('labels')
export class LabelController {

  constructor(
    readonly labelsService: LabelService
  ) { }

  // @Get()
  // findAll(): Promise<ILabel[]> {
  //   return this.labelsService.findAll();
  // }

  @Get("/repertoire/:repertoireId")
  findAllLabelByRepertoireId(@Param("repertoireId") repertoireId: string): Promise<ILabel[]> {
    return this.labelsService.findAllLabelByRepertoireId(repertoireId);
  }

  @Post()
  create(@Body() repertoireDto: CreateLabelDto) {
    return this.labelsService.create(repertoireDto)
  }

  @Get(":id")
  findById(@Param() repertoire: ILabel) {
    return this.labelsService.findById(repertoire.id)
  }

  @Get("/tache/:id")
  findAllByTacheId(@Param('id') tacheId: string): Promise<ILabel[]> {
    return this.labelsService.findAllByTacheId(tacheId);
  }

  @Delete(":id")
  delete(@Param() repertoire: ILabel) {
    return this.labelsService.delete(repertoire.id)
  }

  // Realation manyToMany taches / labels

  @Patch(":labelId/tache/:tacheId")
  AddLabelToTache(@Param("tacheId") tacheId: string, @Body() label: Label) {
    return this.labelsService.AddLabelToTache(tacheId, label.id)
  }

  @Delete(':labelId/tache/:tacheId')
  removeLabelFromTache(
    @Param('tacheId') tacheId: string,
    @Param('labelId') labelId: string
  ) {
    return this.labelsService.removeLabelFromTache(labelId, tacheId);
  }

}
