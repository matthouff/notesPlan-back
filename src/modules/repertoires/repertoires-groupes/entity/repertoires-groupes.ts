import { Groupe } from 'src/modules/groupes/entity/groupes';
import { User } from 'src/modules/users/entity/users';
import { Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Repertoire } from '../../commun/entity/repertoires';
import { IRepertoire, IRepertoireConstructor, IRepertoireCreator } from '../../commun/entity/repertoires.interface';
import { Label } from 'src/modules/labels/entity/labels';

@Entity({ name: 'repertoires_groupes' })
export class RepertoireGroupe extends Repertoire implements IRepertoire {
  @ManyToOne(() => User, (user) => user.repertoiresGroupes)
  @JoinColumn({ name: 'userid' })
  user: User;

  @OneToMany(() => Groupe, (groupe) => groupe.repertoire, { cascade: true })
  repertoiresGroupes: Groupe[];

  @OneToMany(() => Label, (label) => label.repertoire, { cascade: true })
  label: Label[];

  private constructor(data: IRepertoireConstructor) {
    super();

    Object.assign(this, data);
  }

  static factory(data: IRepertoireCreator): RepertoireGroupe {
    return new RepertoireGroupe(data);
  }
}
