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

  // cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoiress WHERE us_nom = 'Berthelot') AS result;
  async findByNom(gr_libelle: string) {
    return await this.model.exist({ where: { gr_libelle } });
  }
}
