import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EditNoteDto } from './dto/notes-edit.dto';
import { Note } from './entity/notes';
import { INote } from './entity/notes.interface';
import { NoteService } from './notes.service';


// http://localhost:3000
@Controller('notes')
export class NoteController {

  constructor(readonly notesService: NoteService) { }

  @Get("/repertoire/:id")
  findAllByRepertoireId(@Param('id') id_repertoire: string): Promise<INote[]> {
    return this.notesService.findAllByRepertoireId(id_repertoire);
  }

  @Get()
  findAll(): Promise<INote[]> {
    return this.notesService.findAll();
  }

  @Post()
  create(@Body() noteDto: Note) {
    return this.notesService.create(noteDto)
  }

  @Get(":id")
  findById(@Param() note: INote) {
    return this.notesService.findById(note.id)
  }

  @Delete(":id")
  delete(@Param() note: INote) {
    return this.notesService.delete(note.id)
  }

  @Patch(":id")
  update(@Body() noteDto: EditNoteDto, @Param() note: INote) {
    return this.notesService.update(noteDto, note.id)
  }

}
