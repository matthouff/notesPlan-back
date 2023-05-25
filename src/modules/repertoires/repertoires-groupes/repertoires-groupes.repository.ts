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

  // cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoiress WHERE us_nom = 'Berthelot') AS result;
  async findByNom(re_libelle: string) {
    return await this.model.exist({ where: { re_libelle } });
  }
}
