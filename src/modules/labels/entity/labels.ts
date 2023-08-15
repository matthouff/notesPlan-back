import { Entity, Column, ManyToMany } from 'typeorm';
import { EntityStarter } from 'src/modules/entity-starter.class';
import {
  ILabel,
  ILabelEditor,
  ILabelEditorOptional,
} from './labels.interface';
import { Tache } from 'src/modules/taches/entity/taches';

@Entity('labels')
export class Label extends EntityStarter implements ILabel {
  @Column({ type: 'varchar', length: 25, nullable: true })
  libelle?: string | null;

  @Column({ type: 'varchar', nullable: true })
  couleur?: string | null;

  @ManyToMany(
    () => Tache,
    tache => tache.label,
    { onDelete: 'CASCADE' },
  )
  tache: Tache[];

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
