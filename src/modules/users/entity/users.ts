import { EntityStarter } from 'src/modules/entity-starter.class';
import { Repertoire } from 'src/modules/repertoires/commun/entity/repertoires';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IUser, IUserEditor, IUserEditorMandatory, IUserEditorOptional } from './users.interface';

@Entity({ name: "users" })
export class User extends EntityStarter implements IUser {

  @Column({ length: 50, nullable: true })
  nom: string;

  @Column({ length: 50, nullable: true })
  prenom: string;

  @Column({ length: 50, nullable: true })
  email: string;

  @Column({ length: 25, nullable: true })
  login: string;

  @Column({ length: 25, nullable: true })
  password: string;


  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles données sont différentes
  editMandatory(data: IUserEditorMandatory): void {
    const { prenom, email } = data;

    if (prenom && prenom !== this.prenom) {
      this.prenom = prenom;
    }

    if (email && email !== this.email) {
      this.email = email;
    }
  }

  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles donées sont différentes
  editOptional(data: IUserEditorOptional): void {
    const { nom } = data;

    if (nom && nom !== this.nom) {
      this.nom = nom;
    }
  }

  // On met a jour les données de l'entité
  edit(data: IUserEditor): void {
    this.editMandatory({ ...data });
    this.editOptional({ ...data });
  }
}