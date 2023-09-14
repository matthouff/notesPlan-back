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

  /**
   * Recherche tous les groupes associés à un répertoire par son ID.
   *
   * @param repertoireId L'ID du répertoire pour lequel rechercher les groupes.
   * @returns Une liste de groupes associés au répertoire spécifié.
   */
  async findByRepertoireId(repertoireId: string) {
    const data = await this.model.findBy({ repertoire: { id: repertoireId } });
    return data;
  }
}
