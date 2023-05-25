import { Entity, Column } from 'typeorm';
import { Repertoire } from '../../commun/entity/repertoires';

@Entity({ name: "repertoires_groupes" })
export class RepertoireGroupe extends Repertoire {
}