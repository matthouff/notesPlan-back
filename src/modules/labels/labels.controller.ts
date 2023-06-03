import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EditLabelDto } from './dto/labels-edit.dto';
import { Label } from './entity/labels';
import { ILabel } from './entity/labels.interface';
import { LabelService } from './labels.service';


// http://localhost:3000
@Controller('labels')
export class LabelController {

  constructor(readonly labelsService: LabelService) { }

  @Get()
  findAll(): Promise<ILabel[]> {
    return this.labelsService.findAll();
  }

  @Post()
  create(@Body() repertoireDto: Label) {
    return this.labelsService.create(repertoireDto)
  }

  @Get(":id")
  findById(@Param() repertoire: ILabel) {
    return this.labelsService.findById(repertoire.id)
  }

  @Delete(":id")
  delete(@Param() repertoire: ILabel) {
    return this.labelsService.delete(repertoire.id)
  }

  @Patch(":id")
  update(@Body() repertoireDto: EditLabelDto, @Param() repertoire: ILabel) {
    return this.labelsService.update(repertoireDto, repertoire.id)
  }

}
