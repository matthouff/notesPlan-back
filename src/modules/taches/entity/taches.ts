import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ITache, ITacheEditor, ITacheEditorMandatory } from './taches.interface';
import { v4 as uuidv4 } from 'uuid';
import { EntityStarter } from 'src/modules/entity-starter.class';
import { Groupe } from 'src/modules/groupes/entity/groupes';

@Entity('taches')
export class Tache extends EntityStarter implements ITache {
  @Column({ type: 'varchar', length: 100 })
  libelle: string;

  @Column({ type: 'varchar', nullable: true })
  couleur: string | null;

  @Column({ type: 'varchar', nullable: true })
  detail: string | null;

  @Column({ type: 'varchar', nullable: true })
  date: string | null;

  @Column({ default: uuidv4() })
  id_groupe: string;

  @ManyToOne(() => Groupe, groupe => groupe.id)
  groupe: Groupe;


  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles données sont différentes
  editMandatory(data: ITacheEditorMandatory): void {
    const { libelle } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
  }

  // On met a jour les données de l'entité
  edit(data: ITacheEditor): void {
    this.editMandatory({ ...data });
  }
}