import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { INote, INoteEditor, INoteEditorOptional } from './notes.interface';
import { v4 as uuidv4 } from 'uuid';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { Groupe } from 'src/modules/groupes/entity/groupes';
import { RepertoireNote } from 'src/modules/repertoires/repertoires-notes/entity/repertoires-notes';

@Entity('notes')
export class Note extends EntityStarter implements INote {
  @Column({ type: 'varchar', length: 100 })
  no_libelle?: string | null;

  @Column({ type: 'varchar', nullable: true })
  no_message?: string | null;

  @Column({ default: uuidv4() })
  id_repertoire: string;

  @ManyToOne(() => RepertoireNote, repertoire => repertoire.id)
  repertoire: RepertoireNote;


  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles donées sont différentes
  editOptional(data: INoteEditorOptional): void {
    const { no_libelle } = data;

    if (no_libelle && no_libelle !== this.no_libelle) {
      this.no_libelle = no_libelle;
    }
  }

  // On met a jour les données de l'entité
  edit(data: INoteEditor): void {
    this.editOptional({ ...data });
  }
}