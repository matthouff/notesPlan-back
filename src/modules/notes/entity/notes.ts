import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { INote, INoteEditor, INoteEditorOptional } from './notes.interface';
import { v4 as uuidv4 } from 'uuid';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { Groupe } from 'src/modules/groupes/entity/groupes';
import { RepertoireNote } from 'src/modules/repertoires/repertoires-notes/entity/repertoires-notes';

@Entity('notes')
export class Note extends EntityStarter implements INote {
  @Column({ type: 'varchar', length: 100 })
  libelle?: string | null;

  @Column({ type: 'varchar', nullable: true })
  message?: string | null;

  @ManyToOne(() => RepertoireNote, repNote => repNote.notes)
  repertoire: RepertoireNote;


  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles donées sont différentes
  editOptional(data: INoteEditorOptional): void {
    const { libelle } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
  }

  // On met a jour les données de l'entité
  edit(data: INoteEditor): void {
    this.editOptional({ ...data });
  }
}