import { EntityStarter } from 'src/modules/entity-starter.class';
import { Entity, Column } from 'typeorm';
import {
  IRepertoireEditor,
  IRepertoireEditorMandatory,
} from './repertoires.interface';

@Entity({ name: 'repertoires' })
export abstract class Repertoire extends EntityStarter {
  @Column({ length: 100 })
  libelle: string;

  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles données sont différentes
  editMandatory(data: IRepertoireEditorMandatory): void {
    const { libelle } = data;

    if (libelle && libelle !== this.libelle) {
      this.libelle = libelle;
    }
  }

  // On met a jour les données de l'entité
  edit(data: IRepertoireEditor): void {
    this.editMandatory({ ...data });
  }
}
