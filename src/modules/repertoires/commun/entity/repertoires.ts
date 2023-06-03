import { EntityStarter } from 'src/modules/entity-starter.class';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { IRepertoire, IRepertoireEditor, IRepertoireEditorMandatory } from './repertoires.interface';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/modules/users/entity/users';

@Entity({ name: "repertoires" })
export class Repertoire extends EntityStarter implements IRepertoire {

  @Column({ length: 100 })
  re_libelle: string;

  @Column({ default: uuidv4() })
  id_user: string;

  @ManyToOne(() => User, user => user.id)
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