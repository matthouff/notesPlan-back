import { Groupe } from 'src/modules/groupes/entity/groupes';
import { User } from 'src/modules/users/entity/users';
import { Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Repertoire } from '../../commun/entity/repertoires';
import { IRepertoire, IRepertoireConstructor, IRepertoireCreator } from '../../commun/entity/repertoires.interface';
import { Label } from 'src/modules/labels/entity/labels';

@Entity({ name: 'repertoires_groupes' })
export class RepertoireGroupe extends Repertoire implements IRepertoire {

  // L'utilisateur auquel appartient ce répertoire de groupes.
  @ManyToOne(() => User, (user) => user.repertoiresGroupes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userid' })
  user: User;

  // Les groupes associés à ce répertoire.
  @OneToMany(() => Groupe, (groupe) => groupe.repertoire, { cascade: true })
  repertoiresGroupes: Groupe[];

  // Les labels associés à ce répertoire.
  @OneToMany(() => Label, (label) => label.repertoire, { cascade: true })
  label: Label[];

  private constructor(data: IRepertoireConstructor) {
    super();

    Object.assign(this, data);
  }

  /**
   * Créer une nouvelle instance de RepertoireGroupe.
   * @param data Les données pour créer le répertoire.
   * @returns Une nouvelle instance de RepertoireGroupe.
   */
  static factory(data: IRepertoireCreator): RepertoireGroupe {
    return new RepertoireGroupe(data);
  }
}
