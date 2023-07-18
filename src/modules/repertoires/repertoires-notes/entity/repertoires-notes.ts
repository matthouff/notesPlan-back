import { Note } from 'src/modules/notes/entity/notes';
import { User } from 'src/modules/users/entity/users';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Repertoire } from '../../commun/entity/repertoires';
import {
  IRepertoire,
  IRepertoireConstructor,
  IRepertoireCreator,
} from '../../commun/entity/repertoires.interface';

@Entity({ name: 'repertoires_notes' })
export class RepertoireNote extends Repertoire implements IRepertoire {
  @ManyToOne(() => User, (user) => user.repertoiresNotes)
  @JoinColumn({ name: 'userid' })
  user: User;

  @OneToMany(() => Note, (note) => note.repertoire)
  notes?: Note[];

  private constructor(data: IRepertoireConstructor) {
    super();

    Object.assign(this, data);
  }

  static factory(data: IRepertoireCreator): RepertoireNote {
    return new RepertoireNote(data);
  }
}
