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

  editMandatory(data: ILabelEditorMandatory): void {
    const { libelle, repertoire } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
    if (repertoire && repertoire !== this.repertoire) {
      this.repertoire = repertoire;
    }
  }

  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles donées sont différentes
  editOptional(data: ILabelEditorOptional): void {
    const { couleur } = data;
    if (couleur && couleur !== this.couleur) {
      this.couleur = couleur;
    }
  }

  // On met a jour les données de l'entité
  edit(data: ILabelEditor): void {
    this.editMandatory({ ...data });
    this.editOptional({ ...data });
  }

  static factory(data: ILabelCreator): Label {
    return new Label(data);
  }
}
