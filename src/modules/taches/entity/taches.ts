import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import {
  ITache,
  ITacheConstructor,
  ITacheCreator,
  ITacheEditor,
  ITacheEditorMandatory,
  ITacheEditorOptional,
} from './taches.interface';
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

  @ManyToOne(() => Groupe, (groupe) => groupe.id)
  @JoinColumn({ name: 'groupeid' })
  groupe?: Groupe | null;

  private constructor(data: ITacheConstructor) {
    super();

    Object.assign(this, data);
  }


  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles données sont différentes
  editMandatory(data: ITacheEditorMandatory): void {
    const { libelle } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
  }

  editOptionnal(data: ITacheEditorOptional): void {
    const { couleur, detail, groupe } = data;

    if (couleur && couleur !== this.libelle) {
      this.couleur = couleur;
    }
    if (detail && detail !== this.detail) {
      this.detail = detail;
    }
    if (groupe && groupe !== this.groupe) {
      this.groupe = groupe;
    }
  }

  // On met a jour les données de l'entité
  edit(data: ITacheEditor): void {
    this.editOptionnal({ ...data });
    this.editMandatory({ ...data });
  }

  static factory(data: ITacheCreator): Tache {
    return new Tache(data);
  }
}
