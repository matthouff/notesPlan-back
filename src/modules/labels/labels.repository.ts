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

  async findLabelByTacheId(tacheId: string) {
    const data = await this.model.findBy({ tache: { id: tacheId } });
    return data;
  }

  async findAllLabelByRepertoireId(repertoireId: string) {
    const data = await this.model.findBy({ repertoire: { id: repertoireId } });
    return data;
  }
}
