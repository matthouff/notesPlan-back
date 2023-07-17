import { Note } from 'src/modules/notes/entity/notes';
import { User } from 'src/modules/users/entity/users';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Repertoire } from '../../commun/entity/repertoires';
import { IRepertoire } from '../../commun/entity/repertoires.interface';

@Entity({ name: "repertoires_notes" })
export class RepertoireNote extends Repertoire implements IRepertoire {
  @ManyToOne(() => User, user => user.repertoiresNotes)
  user: User;

  @OneToMany(() => Note, note => note.repertoire)
  notes: Note[];
}