import { Injectable } from "@nestjs/common";
import { RepertoireNote } from "../repertoires/repertoires-notes/entity/repertoires-notes";
import { EditNoteDto } from "./dto/notes-edit.dto";
import { Note } from "./entity/notes";
import { INote } from "./entity/notes.interface";
import { NoteRepository } from "./notes.repository";
import { RepertoiresActions } from "../repertoires/repertoires-notes/repertoires-notes.actions";
import { CreateNoteDto } from "./dto/notes-create.dto";

@Injectable()
export class NoteService {

  constructor(readonly notesRepository: NoteRepository, readonly repertoiresActions: RepertoiresActions) { }

  async findAll(): Promise<INote[]> {
    return await this.notesRepository.getAll();
  }

  async findAllByRepertoireId(repertoireId: string): Promise<INote[]> {
    return await this.notesRepository.findByRepertoireId(repertoireId);
  }

  async create(data: CreateNoteDto) {
    const repertoire = await this.repertoiresActions.getrepertoiresById(data.repertoireId);

    console.log(repertoire);
    console.log(data);

    const note = Note.factory({ ...data, repertoire });

    return await this.notesRepository.save(note);
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
