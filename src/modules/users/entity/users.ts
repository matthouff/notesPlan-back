import { EntityStarter } from 'src/modules/entity-starter.class';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IUser, IUserEditor, IUserEditorMandatory, IUserEditorOptional } from './users.interface';

@Entity({ name: "users" })
export class User extends EntityStarter implements IUser {

  @Column({ length: 50, nullable: true })
  us_nom: string;

  @Column({ length: 50, nullable: true })
  us_prenom: string;

  @Column({ length: 50, nullable: true })
  us_email: string;

  @Column({ length: 25, nullable: true })
  us_login: string;

  @Column({ length: 25, nullable: true })
  us_password: string;


  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles données sont différentes
  editMandatory(data: IUserEditorMandatory): void {
    const { us_prenom, us_email } = data;

    if (us_prenom && us_prenom !== this.us_prenom) {
      this.us_prenom = us_prenom;
    }

    if (us_email && us_email !== this.us_email) {
      this.us_email = us_email;
    }
  }

  // fonction qui ne renvoie rien (void)
  // Permet de vérifier si les nouvelles donées sont différentes
  editOptional(data: IUserEditorOptional): void {
    const { us_nom } = data;

    if (us_nom && us_nom !== this.us_nom) {
      this.us_nom = us_nom;
    }
  }

  // On met a jour les données de l'entité
  edit(data: IUserEditor): void {
    this.editMandatory({ ...data });
    this.editOptional({ ...data });
  }
}