import { EntityStarter } from 'src/modules/entity-starter.class';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { IRepertoire, IRepertoireEditor, IRepertoireEditorMandatory } from './repertoires.interface';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/modules/users/entity/users';
import { Note } from 'src/modules/notes/entity/notes';

@Entity({ name: "repertoires" })
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