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

  // cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoires WHERE userId = 'id_user') AS result;
  async findByUserId(userId: string) {
    const data = await this.model.findBy({ user: { id: userId } });
    return data;
  }
}
