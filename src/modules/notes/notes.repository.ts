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

  // cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoiress WHERE nom = 'Berthelot') AS result;
  async findByNom(libelle: string) {
    return await this.model.exist({ where: { libelle } });
  }

  async findByRepertoireId(id: string) {
    try {
      const notes = await this.model.find({ where: { id_repertoire: id } });
      return notes;
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      throw new Error("Erreur lors de la récupération des notes.");
    }
  }
}
