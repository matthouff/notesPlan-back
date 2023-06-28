import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { RepositoryStarter } from "src/modules/repository-starter.class";
import { DataSource } from "typeorm";
import { Repertoire } from "../commun/entity/repertoires";
import { RepertoireGroupe } from "./entity/repertoires-groupes";

@Injectable()
export class RepertoiresGroupesRepository extends RepositoryStarter<RepertoireGroupe> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(RepertoireGroupe));
  }

  async findAllByUserId(id_user: string) {
    return await this.model.find({ where: { user: { id: id_user } } });
  }
}
