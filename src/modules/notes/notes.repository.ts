import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { RepositoryStarter } from 'src/modules/repository-starter.class';
import { DataSource } from 'typeorm';
import { RepertoireNote } from '../repertoires/repertoires-notes/entity/repertoires-notes';
import { Note } from './entity/notes';

@Injectable()
export class NoteRepository extends RepositoryStarter<Note> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(Note));
  }

  // cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoiress WHERE nom = 'Berthelot') AS result;
  async findByNom(libelle: string) {
    return await this.model.exist({ where: { libelle } });
  }

  async findByRepertoireId(id_repertoire: string) {
    const data = await this.model.find({
      where: { repertoire: { id: id_repertoire } },
    });
    return data;
  }
}
