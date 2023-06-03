import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { RepositoryStarter } from "src/modules/repository-starter.class";
import { DataSource } from "typeorm";
import { Note } from "./entity/notes";

@Injectable()
export class NoteRepository extends RepositoryStarter<Note> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(Note));
  }

  // cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoiress WHERE us_nom = 'Berthelot') AS result;
  async findByNom(no_libelle: string) {
    return await this.model.exist({ where: { no_libelle } });
  }
}