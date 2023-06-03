import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { Groupe } from 'src/modules/groupes/entity/groupes';
import { ILabel, ILabelEditor, ILabelEditorMandatory, ILabelEditorOptional } from './labels.interface';
import { IUserEditorOptional } from 'src/modules/users/entity/users.interface';
import { Tache } from 'src/modules/taches/entity/taches';

@Entity('labels')
export class Label extends EntityStarter implements ILabel {
  @Column({ type: 'varchar', length: 25, nullable: true })
  la_libelle?: string | null;

  @Column({ type: 'varchar', nullable: true })
  la_couleur?: string | null;

  @Column({ default: uuidv4() })
  id_tache: string;

  @ManyToOne(() => Tache, tache => tache.id)
  @JoinColumn({ name: 'id_tache' })
  tache: Tache;


  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles donées sont différentes
  editOptional(data: ILabelEditorOptional): void {
    const { la_libelle, la_couleur } = data;

    if (la_libelle && la_libelle !== this.la_libelle) {
      this.la_libelle = la_libelle;
    }
    if (la_couleur && la_couleur !== this.la_couleur) {
      this.la_couleur = la_couleur;
    }
  }

  // On met a jour les données de l'entité
  edit(data: ILabelEditor): void {
    this.editOptional({ ...data });
  }
}