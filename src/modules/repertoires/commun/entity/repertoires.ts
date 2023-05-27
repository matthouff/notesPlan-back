import { EntityStarter } from 'src/modules/entity-starter.class';
import { User } from 'src/modules/users/entity/users';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { IRepertoire, IRepertoireEditor, IRepertoireEditorMandatory } from './repertoires.interface';

@Entity({ name: "repertoires" })
export class Repertoire extends EntityStarter implements IRepertoire {

  @Column({ length: 100 })
  re_libelle: string;

  @Column({ type: 'uuid' })
  id_user: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;


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