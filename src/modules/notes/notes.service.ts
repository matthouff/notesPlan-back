import { Injectable } from "@nestjs/common";
import { EditNoteDto } from "./dto/notes-edit.dto";
import { Note } from "./entity/notes";
import { INote } from "./entity/notes.interface";
import { NoteRepository } from "./notes.repository";

@Injectable()
export class NoteService {

  constructor(readonly notesRepository: NoteRepository) { }

  async findAll(): Promise<INote[]> {
    return await this.notesRepository.getAll();
  }

  async create(data: Note): Promise<Note> {
    return await this.notesRepository.save(data);
  }

  async findById(id: string): Promise<Note> {
    return await this.notesRepository.findByID(id);
  }

  async delete(id: string) {
    return await this.notesRepository.deleteByID(id);
  }

  async update(editnotesDto: EditNoteDto, id: string) {
    let notes = await this.notesRepository.findByID(id);

    notes.edit(editnotesDto);

    return await this.notesRepository.save(notes);
  }
}
