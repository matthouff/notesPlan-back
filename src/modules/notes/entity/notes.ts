import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import {
  INote,
  INoteConstructor,
  INoteCreator,
  INoteEditor,
  INoteEditorMandatory,
  INoteEditorOptional,
} from './notes.interface';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { RepertoireNote } from 'src/modules/repertoires/repertoires-notes/entity/repertoires-notes';

@Entity('notes')
export class Note extends EntityStarter implements INote {
  @Column({ type: 'varchar', length: 100 })
  libelle: string;

  @Column({ type: 'varchar', nullable: true })
  message?: string | null;

  @ManyToOne(() => RepertoireNote, (repNote) => repNote.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'repertoireid' })
  repertoire?: RepertoireNote | null;

  private constructor(data: INoteConstructor) {
    super();

    Object.assign(this, data);
  }

  // Méthode qui ne renvoie rien (void)
  // Méthode pour mettre à jour les propriétés optionnelles de l'entité
  editOptional(data: INoteEditorOptional): void {
    const { message } = data;

    if (message && message !== this.message) {
      this.message = message;
    }
  }

  // Méthode qui ne renvoie rien (void)
  // Méthode pour mettre à jour les propriétés obligatoires de l'entité
  editMandatory(data: INoteEditorMandatory): void {
    const { libelle } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
  }

  // Méthode pour mettre à jour l'entité avec les nouvelles données
  edit(data: INoteEditor): void {
    this.editOptional({ ...data });
    this.editMandatory({ ...data });
  }

  // Méthode statique pour créer une instance de Label
  static factory(data: INoteCreator): Note {
    return new Note(data);
  }
}
