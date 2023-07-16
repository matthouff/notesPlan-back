import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { RepositoryStarter } from "src/modules/repository-starter.class";
import { DataSource } from "typeorm";
import { Groupe } from "./entity/groupes";

@Injectable()
export class GroupesRepository extends RepositoryStarter<Groupe> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(Groupe));
  }

  async findByRepertoireId(repertoireId: string) {
    try {
      return await this.model.find({ where: { id: repertoireId } });
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      throw new Error("Erreur lors de la récupération des notes.");
    }
  }
}
