
import { EditNoteDto } from "src/modules/notes/dto/notes-edit.dto";
import { Note } from "src/modules/notes/entity/notes";
import { Repertoire } from "src/modules/repertoires/commun/entity/repertoires";
import { v4 as uuidv4 } from 'uuid';

export default class NotesServiceMock {
  private notes: Note[] = [];

  async findAll(): Promise<Note[]> {
    return this.notes;
  }

  async findAllByrepertoireId(repertoire: Repertoire): Promise<Note[]> {
    return this.notes.filter(note => note.repertoire === repertoire);
  }

  async create(data: any): Promise<Note> {
    const newNote = { ...data, id: uuidv4() };
    this.notes.push(newNote);
    return newNote;
  }

  async findById(id: string): Promise<Note> {
    return this.notes.find(note => note.id === id);
  }

  async delete(id: string) {
    const index = this.notes.findIndex(note => note.id === id);
    if (index !== -1) {
      this.notes.splice(index, 1);
    }
  }

  async update(editnoteDto: EditNoteDto, id: string) {
    const note = this.notes.find(note => note.id === id);
    if (note) {
      note.libelle = editnoteDto.libelle;
      note.message = editnoteDto.message;
    }
    return note;
  }
}
