import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { RepositoryStarter } from "src/modules/repository-starter.class";
import { DataSource } from "typeorm";
import { RepertoireNote } from "./entity/repertoires-notes";

@Injectable()
export class RepertoiresNotesRepository extends RepositoryStarter<RepertoireNote> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(RepertoireNote));
  }

  // cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoires WHERE nom = 'Berthelot') AS result;
  async findByNom(libelle: string) {
    return await this.model.exist({ where: { libelle } });
  }

  // cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoires WHERE userId = 'id_user') AS result;
  async findByUserId(userId: string) {
    const data = await this.model.find({ where: { user: { id: userId } } });
    return data;
  }
}
