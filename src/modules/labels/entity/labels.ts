import { Entity, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { Groupe } from 'src/modules/groupes/entity/groupes';
import {
  ILabel,
  ILabelEditor,
  ILabelEditorMandatory,
  ILabelEditorOptional,
} from './labels.interface';
import { IUserEditorOptional } from 'src/modules/users/entity/users.interface';
import { Tache } from 'src/modules/taches/entity/taches';

@Entity('labels')
export class Label extends EntityStarter implements ILabel {
  @Column({ type: 'varchar', length: 25, nullable: true })
  libelle?: string | null;

  @Column({ type: 'varchar', nullable: true })
  couleur?: string | null;

  @Column({ default: uuidv4() })
  id_tache: string;

  @ManyToOne(() => Tache, (tache) => tache.id)
  @JoinColumn({ name: 'tacheid' })
  tache: Tache;

  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles donées sont différentes
  editOptional(data: ILabelEditorOptional): void {
    const { libelle, couleur } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
    if (couleur && couleur !== this.couleur) {
      this.couleur = couleur;
    }
  }

  // On met a jour les données de l'entité
  edit(data: ILabelEditor): void {
    this.editOptional({ ...data });
  }
}
