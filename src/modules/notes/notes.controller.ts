import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EditNoteDto } from './dto/notes-edit.dto';
import { Note } from './entity/notes';
import { INote } from './entity/notes.interface';
import { NoteService } from './notes.service';


// http://localhost:3000
@Controller('notes')
export class NoteController {

  constructor(readonly notesService: NoteService) { }

  @Get()
  findAll(): Promise<INote[]> {
    return this.notesService.findAll();
  }

  @Post()
  create(@Body() repertoireDto: Note) {
    return this.notesService.create(repertoireDto)
  }

  @Get(":id")
  findById(@Param() repertoire: INote) {
    return this.notesService.findById(repertoire.id)
  }

  @Delete(":id")
  delete(@Param() repertoire: INote) {
    return this.notesService.delete(repertoire.id)
  }

  @Patch(":id")
  update(@Body() repertoireDto: EditNoteDto, @Param() repertoire: INote) {
    return this.notesService.update(repertoireDto, repertoire.id)
  }

}
