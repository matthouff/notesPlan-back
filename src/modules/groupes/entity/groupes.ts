import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IGroupe, IGroupeEditor, IGroupeEditorMandatory } from './groupes.interface';
import { v4 as uuidv4 } from 'uuid';
import { EntityStarter } from 'src/modules/entity-starter.class';

@Entity('groupes')
export class Groupe extends EntityStarter implements IGroupe {
  @Column({ type: 'varchar', length: 50 })
  gr_libelle: string;

  @Column({ type: 'varchar', nullable: true })
  gr_couleur: string | null;

  @Column({ default: uuidv4() })
  id_repertoire: string;



  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles données sont différentes
  editMandatory(data: IGroupeEditorMandatory): void {
    const { gr_libelle } = data;

    if (gr_libelle && gr_libelle !== this.gr_libelle) {
      this.gr_libelle = gr_libelle;
    }
  }

  // On met a jour les données de l'entité
  edit(data: IGroupeEditor): void {
    this.editMandatory({ ...data });
  }
}