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

  // cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoiress WHERE us_nom = 'Berthelot') AS result;
  async findByNom(ta_libelle: string) {
    return await this.model.exist({ where: { ta_libelle } });
  }
}
