import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { RepositoryStarter } from 'src/modules/repository-starter.class';
import { DataSource } from 'typeorm';
import { Note } from './entity/notes';

@Injectable()
export class NoteRepository extends RepositoryStarter<Note> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(Note));
  }

  /**
   * Recherche si une note avec un libellé spécifique existe dans la base de données.
   * cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoiress WHERE nom = 'Berthelot') AS result;
   * 
   * @param libelle Le libellé de la note à rechercher.
   * @returns Une valeur booléenne indiquant si la note existe (true) ou non (false).
   */
  async findByNom(libelle: string) {
    return await this.model.exist({ where: { libelle } });
  }

  /**
   * Recherche et renvoie toutes les notes associées à un répertoire donné par son ID.
   * @param id_repertoire L'ID du répertoire pour lequel rechercher les notes associées.
   * @returns Un tableau contenant toutes les notes associées au répertoire.
   */
  async findByRepertoireId(id_repertoire: string) {
    const data = await this.model.find({
      where: { repertoire: { id: id_repertoire } },
    });
    return data;
  }
}
