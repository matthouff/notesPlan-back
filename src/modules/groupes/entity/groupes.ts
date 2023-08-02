import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { IGroupe, IGroupeConstructor, IGroupeCreator, IGroupeEditor, IGroupeEditorMandatory } from './groupes.interface';
import { v4 as uuidv4 } from 'uuid';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { Repertoire } from 'src/modules/repertoires/commun/entity/repertoires';
import { RepertoireGroupe } from 'src/modules/repertoires/repertoires-groupes/entity/repertoires-groupes';
import { Tache } from 'src/modules/taches/entity/taches';

@Entity('groupes')
export class Groupe extends EntityStarter implements IGroupe {
  @Column({ type: 'varchar', length: 50 })
  libelle: string;

  @Column({ type: 'varchar', nullable: true })
  couleur: string | null

  @Column({ type: 'jsonb', nullable: true })
  taches: Tache[] | null

  @ManyToOne(() => RepertoireGroupe, repertoire => repertoire.id)
  @JoinColumn({ name: 'repertoireid' })
  repertoire: RepertoireGroupe;


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

  // On met a jour les données de l'entité
  edit(data: IGroupeEditor): void {
    this.editMandatory({ ...data });
  }

  static factory(data: IGroupeCreator): Groupe {
    return new Groupe(data);
  }
}