import { Entity, Column, ManyToMany, ManyToOne, JoinColumn } from 'typeorm';
import { EntityStarter } from 'src/modules/entity-starter.class';
import {
  ILabel,
  ILabelConstructor,
  ILabelCreator,
  ILabelEditor,
  ILabelEditorMandatory,
  ILabelEditorOptional,
} from './labels.interface';
import { Tache } from 'src/modules/taches/entity/taches';
import { RepertoireGroupe } from 'src/modules/repertoires/repertoires-groupes/entity/repertoires-groupes';

@Entity('labels')
export class Label extends EntityStarter implements ILabel {
  @Column({ type: 'varchar', length: 25, nullable: true })
  libelle: string;

  @Column({ type: 'varchar', nullable: true })
  couleur?: string | null;

  @ManyToOne(() => RepertoireGroupe, (repGroupe) => repGroupe.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'repertoireid' })
  repertoire: RepertoireGroupe;

  @ManyToMany(
    () => Tache,
    tache => tache.label,
    { onDelete: 'CASCADE' },
  )
  tache: Tache[];


  private constructor(data: ILabelConstructor) {
    super();

    Object.assign(this, data);
  }

  // Méthode qui ne renvoie rien (void)
  // Méthode pour mettre à jour les propriétés obligatoires de l'entité
  editMandatory(data: ILabelEditorMandatory): void {
    const { libelle, repertoire } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
    if (repertoire && repertoire !== this.repertoire) {
      this.repertoire = repertoire;
    }
  }

  // Méthode qui ne renvoie rien (void)
  // Méthode pour mettre à jour les propriétés optionnelles de l'entité
  editOptional(data: ILabelEditorOptional): void {
    const { couleur } = data;
    if (couleur && couleur !== this.couleur) {
      this.couleur = couleur;
    }
  }

  // Méthode pour mettre à jour l'entité avec les nouvelles données
  edit(data: ILabelEditor): void {
    this.editMandatory({ ...data });
    this.editOptional({ ...data });
  }

  // Méthode statique pour créer une instance de Label
  static factory(data: ILabelCreator): Label {
    return new Label(data);
  }
}
