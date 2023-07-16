import { Entity, Column } from 'typeorm';
import { Repertoire } from '../../commun/entity/repertoires';

@Entity({ name: "repertoires_groupes" })
export class RepertoireGroupe extends Repertoire {
  constructor(libelle: string, id_user: string) {
    super(); // Appelle le constructeur de la classe parente

    this.libelle = libelle;
    this.id_user = id_user;
  }
}