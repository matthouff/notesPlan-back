import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { IGroupe, IGroupeEditor, IGroupeEditorMandatory } from './groupes.interface';
import { v4 as uuidv4 } from 'uuid';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { Repertoire } from 'src/modules/repertoires/commun/entity/repertoires';
import { RepertoireGroupe } from 'src/modules/repertoires/repertoires-groupes/entity/repertoires-groupes';

@Entity('groupes')
export class Groupe extends EntityStarter implements IGroupe {
  @Column({ type: 'varchar', length: 50 })
  libelle: string;

  @Column({ type: 'varchar', nullable: true })
  couleur: string | null;

  @ManyToOne(() => RepertoireGroupe, repertoire => repertoire.id)
  repertoireId: RepertoireGroupe;


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
}