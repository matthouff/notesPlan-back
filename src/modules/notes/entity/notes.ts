import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import {
  INote,
  INoteConstructor,
  INoteCreator,
  INoteEditor,
  INoteEditorMandatory,
  INoteEditorOptional,
} from './notes.interface';
import { v4 as uuidv4 } from 'uuid';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { Groupe } from 'src/modules/groupes/entity/groupes';
import { RepertoireNote } from 'src/modules/repertoires/repertoires-notes/entity/repertoires-notes';

@Entity('notes')
export class Note extends EntityStarter implements INote {
  @Column({ type: 'varchar', length: 100 })
  libelle: string;

  @Column({ type: 'varchar', nullable: true })
  message?: string | null;

  @ManyToOne(() => RepertoireNote, (repNote) => repNote.notes)
  @JoinColumn({ name: 'repertoireid' })
  repertoire?: RepertoireNote | null;

  private constructor(data: INoteConstructor) {
    super();

    Object.assign(this, data);
  }

  static factory(data: INoteCreator): Note {
    return new Note(data);
  }

  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles donées sont différentes
  editOptional(): void {
  }

  editMandatory(data: INoteEditorMandatory): void {
    const { libelle } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
  }

  // On met a jour les données de l'entité
  edit(data: INoteEditor): void {
    this.editMandatory({ ...data });
  }
}
