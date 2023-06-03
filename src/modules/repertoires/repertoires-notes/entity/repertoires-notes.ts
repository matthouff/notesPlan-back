import { Entity } from 'typeorm';
import { Repertoire } from '../../commun/entity/repertoires';

@Entity({ name: "repertoires_notes" })
export class RepertoireNote extends Repertoire {
}