import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import {
  ITache,
  ITacheConstructor,
  ITacheCreator,
  ITacheEditor,
  ITacheEditorMandatory,
  ITacheEditorOptional,
} from './taches.interface';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { Groupe } from 'src/modules/groupes/entity/groupes';
import { Label } from 'src/modules/labels/entity/labels';

@Entity('taches')
export class Tache extends EntityStarter implements ITache {
  @Column({ type: 'varchar', length: 100 })
  libelle: string;

  @Column({ type: 'varchar', nullable: true })
  detail: string | null;

  @Column({ type: 'varchar', nullable: true })
  date: string | null;

  /**
   * Le groupe auquel appartient la tâche.
   */
  @ManyToOne(() => Groupe, (groupe) => groupe.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupeid' })
  groupe: Groupe;

  /**
   * Les étiquettes associées à la tâche (optionnelles).
   */
  @ManyToMany(
    () => Label,
    label => label.tache, //optional
    { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'tache_label',
    joinColumn: {
      name: 'tacheId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'labelId',
      referencedColumnName: 'id',
    },
  })
  label: Label[];

  private constructor(data: ITacheConstructor) {
    super();

    Object.assign(this, data);
  }

  /**
   * fonction qui ne renvoie rien (void)
   * Modifie les propriétés obligatoires de la tâche.
   * @param data Les données de modification obligatoires.
   */
  editMandatory(data: ITacheEditorMandatory): void {
    const { libelle, groupe } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
    if (groupe && groupe !== this.groupe) {
      this.groupe = groupe;
    }
  }

  /**
   * Modifie les propriétés optionnelles de la tâche.
   * @param data Les données de modification optionnelles.
   */
  editOptionnal(data: ITacheEditorOptional): void {
    const { detail } = data;

    if (detail && detail !== this.detail) {
      this.detail = detail;
    }
  }

  // Méthode pour mettre à jour l'entité avec les nouvelles données
  edit(data: ITacheEditor): void {
    this.editOptionnal({ ...data });
    this.editMandatory({ ...data });
  }

  // Méthode statique pour créer une instance de Label
  static factory(data: ITacheCreator): Tache {
    return new Tache(data);
  }
}
