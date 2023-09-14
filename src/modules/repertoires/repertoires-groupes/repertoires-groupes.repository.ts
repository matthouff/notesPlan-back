import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { RepositoryStarter } from "src/modules/repository-starter.class";
import { DataSource } from "typeorm";
import { RepertoireGroupe } from "./entity/repertoires-groupes";

@Injectable()
export class RepertoiresGroupesRepository extends RepositoryStarter<RepertoireGroupe> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(RepertoireGroupe));
  }

  /**
   * Recherche et renvoie tous les répertoires de groupes associés à un utilisateur donné.
   * cette méthode fait référence à cette requête : SELECT EXISTS (SELECT * FROM repertoires WHERE userId = 'id_user') AS result;
   * 
   * @param userId L'identifiant de l'utilisateur.
   * @returns Une liste des répertoires de groupes de l'utilisateur.
   */
  async findByUserId(userId: string) {
    const data = await this.model.findBy({ user: { id: userId } });
    return data;
  }
}
