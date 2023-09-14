import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IGroupe, IGroupeConstructor, IGroupeCreator, IGroupeEditor, IGroupeEditorMandatory, IGroupeEditorOptional } from './groupes.interface';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { RepertoireGroupe } from 'src/modules/repertoires/repertoires-groupes/entity/repertoires-groupes';
import { Tache } from 'src/modules/taches/entity/taches';
import { Label } from 'src/modules/labels/entity/labels';

@Entity('groupes')
export class Groupe extends EntityStarter implements IGroupe {
  @Column({ type: 'varchar', length: 50 })
  libelle: string;

  @Column({ type: 'varchar', nullable: true })
  couleur: string | null

  @Column({ type: 'jsonb', nullable: true })
  taches: Tache[] | null

  @ManyToOne(() => RepertoireGroupe, repertoire => repertoire.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'repertoireid' })
  repertoire: RepertoireGroupe;

  @OneToMany(() => Tache, (tache) => tache.groupe, { cascade: true })
  tache: Tache[];


  private constructor(data: IGroupeConstructor) {
    super();

    Object.assign(this, data);

    if (!this.taches) {
      this.taches = [];
    }
  }

  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles données sont différentes
  editMandatory(data: IGroupeEditorMandatory): void {
    const { libelle } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
  }

  editOptionnal(data: IGroupeEditorOptional): void {
    const { couleur } = data;

    if (couleur && couleur !== this.couleur) {
      this.couleur = couleur;
    }
  }

  // On met a jour les données de l'entité
  edit(data: IGroupeEditor): void {
    this.editOptionnal({ ...data });
    this.editMandatory({ ...data });
  }

  // Factory method pour créer une instance de Groupe
  static factory(data: IGroupeCreator): Groupe {
    return new Groupe(data);
  }
}