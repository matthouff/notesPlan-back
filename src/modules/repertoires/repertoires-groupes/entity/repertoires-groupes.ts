import { Groupe } from 'src/modules/groupes/entity/groupes';
import { User } from 'src/modules/users/entity/users';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Repertoire } from '../../commun/entity/repertoires';
import { IRepertoire, IRepertoireConstructor, IRepertoireCreator } from '../../commun/entity/repertoires.interface';

@Entity({ name: 'repertoires_groupes' })
export class RepertoireGroupe extends Repertoire implements IRepertoire {
  @ManyToOne(() => User, (user) => user.repertoiresGroupes)
  @JoinColumn({ name: 'userid' })
  user: User;

  @OneToMany(() => Groupe, (groupe) => groupe.repertoire)
  repertoiresGroupes: Groupe[];

  private constructor(data: IRepertoireConstructor) {
    super();

    Object.assign(this, data);
  }

  static factory(data: IRepertoireCreator): RepertoireGroupe {
    return new RepertoireGroupe(data);
  }
}
