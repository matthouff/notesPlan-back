import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { RepositoryStarter } from "src/modules/repository-starter.class";
import { DataSource } from "typeorm";
import { Tache } from "./entity/taches";

@Injectable()
export class TacheRepository extends RepositoryStarter<Tache> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(Tache));
  }

  /**
   * Recherche et renvoie toutes les tâches associées à un groupe spécifique.
   * @param groupeId L'identifiant du groupe pour lequel rechercher les tâches.
   * @returns Une liste des tâches associées au groupe.
   */
  async findByGroupeId(groupeId: string) {
    const data = await this.model.findBy({ groupe: { id: groupeId } });
    return data;
  }
}
