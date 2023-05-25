import { EntityStarter } from 'src/modules/entity-starter.class';
import { Entity, Column } from 'typeorm';
import { IRepertoire, IRepertoireEditor, IRepertoireEditorMandatory } from './repertoires.interface';

@Entity({ name: "repertoires" })
export abstract class Repertoire extends EntityStarter implements IRepertoire {

  @Column({ length: 50 })
  re_libelle: string;

  @Column({ length: 50 })
  id_user: string;


  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles données sont différentes
  editMandatory(data: IRepertoireEditorMandatory): void {
    const { re_libelle } = data;

    if (re_libelle && re_libelle !== this.re_libelle) {
      this.re_libelle = re_libelle;
    }
  }

  // On met a jour les données de l'entité
  edit(data: IRepertoireEditor): void {
    this.editMandatory({ ...data });
  }
}