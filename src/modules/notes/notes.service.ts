import { BadRequestException, Injectable } from '@nestjs/common';
import { EditNoteDto } from './dto/notes-edit.dto';
import { Note } from './entity/notes';
import { INote } from './entity/notes.interface';
import { NoteRepository } from './notes.repository';
import { RepertoiresActions } from '../repertoires/repertoires-notes/repertoires-notes.actions';
import { CreateNoteDto } from './dto/notes-create.dto';

@Injectable()
export class NoteService {
  constructor(
    readonly notesRepository: NoteRepository,
    readonly repertoiresActions: RepertoiresActions,
  ) { }

  /**
   * Récupère toutes les notes associées à un répertoire par son ID.
   * @param repertoireId L'ID du répertoire pour lequel rechercher les notes.
   * @returns Une liste de toutes les notes associées au répertoire.
   */
  async findAllByRepertoireId(repertoireId: string): Promise<INote[]> {
    return await this.notesRepository.findByRepertoireId(repertoireId);
  }

  /**
   * Crée une nouvelle note.
   * @param data Les données pour créer la note.
   * @returns La note créée.
   */
  async create(data: CreateNoteDto) {
    try {
      const repertoire = await this.repertoiresActions.getrepertoiresById(
        data.repertoireId,
      );
      const repertoireNote = Note.factory({ ...data, repertoire });
      return await this.notesRepository.save(repertoireNote);
    } catch (error) {
      throw new BadRequestException({
        message: "La note n'a pas pu être créée.",
        type: 'error',
      });
    }
  }

  /**
   * Récupère une note par son ID.
   * @param id L'ID de la note à récupérer.
   * @returns La note récupérée.
   */
  async findById(id: string): Promise<Note> {
    return await this.notesRepository.findByID(id);
  }

  /**
   * Supprime une note par son ID.
   * @param id L'ID de la note à supprimer.
   * @returns Rien.
   */
  async delete(id: string) {
    return await this.notesRepository.deleteByID(id);
  }

  /**
   * Met à jour une note existante.
   * @param editnotesDto Les données de mise à jour de la note.
   * @param id L'ID de la note à mettre à jour.
   * @returns La note mise à jour.
   */
  async update(editnotesDto: EditNoteDto, id: string) {
    let notes = await this.notesRepository.findByID(id);
    notes.edit(editnotesDto);

    return await this.notesRepository.save(notes);
  }
}
