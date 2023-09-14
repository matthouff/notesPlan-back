import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { RepositoryStarter } from "src/modules/repository-starter.class";
import { DataSource } from "typeorm";
import { Label } from "./entity/labels";

@Injectable()
export class LabelRepository extends RepositoryStarter<Label> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(Label));
  }

  /**
   * Récupère tous les labels liés à une tâche spécifique par son ID.
   * @param tacheId L'ID de la tâche pour laquelle récupérer les labels.
   * @returns Une liste de labels liés à la tâche.
   */
  async findLabelByTacheId(tacheId: string) {
    const data = await this.model.findBy({ tache: { id: tacheId } });
    return data;
  }

  /**
   * Récupère tous les labels liés à un répertoire spécifique par son ID.
   * @param repertoireId L'ID du répertoire pour lequel récupérer les labels.
   * @returns Une liste de labels liés au répertoire.
   */
  async findAllLabelByRepertoireId(repertoireId: string) {
    const data = await this.model.findBy({ repertoire: { id: repertoireId } });
    return data;
  }
}
