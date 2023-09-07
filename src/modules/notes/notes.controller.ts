import {
  BadRequestException,
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

// http://127.0.0.1:3000
@Controller('notes')
export class NoteController {
  constructor(readonly notesService: NoteService) {}

  @Get('/repertoire-notes/:id')
  findAllByRepertoireId(@Param('id') repertoireId: string) {
    return this.notesService.findAllByRepertoireId(repertoireId);
  }

  // @Get()
  // findAll(): Promise<INote[]> {
  //   return this.notesService.findAll();
  // }

  @Post()
  async create(@Body() noteDto: CreateNoteDto) {
    try {
      await this.notesService.create(noteDto);

      return {
        message: 'La note à bien été ajoutée',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }

  @Get(':id')
  async findById(@Param() note: INote) {
    try {
      return await this.notesService.findById(note.id);
    } catch (error) {
      throw new BadRequestException("La note n'a pas été trouvé");
    }
  }

  @Delete(':id')
  async delete(@Param() note: INote) {
    try {
      await this.notesService.delete(note.id);

      return {
        message: 'La note à bien été supprimée',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }

  @Patch(':id')
  async update(@Body() noteDto: EditNoteDto, @Param() note: INote) {
    try {
      await this.notesService.update(noteDto, note.id);

      return {
        message: 'La note à bien été modifiée',
        type: 'success',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Une erreur est survenue',
        type: 'error',
      });
    }
  }
}
