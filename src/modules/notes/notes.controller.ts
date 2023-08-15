import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EditNoteDto } from './dto/notes-edit.dto';
import { INote } from './entity/notes.interface';
import { NoteService } from './notes.service';
import { CreateNoteDto } from './dto/notes-create.dto';

// http://localhost:3000
@Controller('notes')
export class NoteController {
  constructor(readonly notesService: NoteService) { }

  @Get('/repertoire-notes/:id')
  findAllByRepertoireId(@Param('id') repertoireId: string) {
    console.log(repertoireId);
    return this.notesService.findAllByRepertoireId(repertoireId);
  }

  // @Get()
  // findAll(): Promise<INote[]> {
  //   return this.notesService.findAll();
  // }

  @Post()
  create(@Body() noteDto: CreateNoteDto) {
    return this.notesService.create(noteDto);
  }

  @Get(':id')
  findById(@Param() note: INote) {
    return this.notesService.findById(note.id);
  }

  @Delete(':id')
  delete(@Param() note: INote) {
    return this.notesService.delete(note.id);
  }

  @Patch(':id')
  update(@Body() noteDto: EditNoteDto, @Param() note: INote) {
    return this.notesService.update(noteDto, note.id);
  }
}
