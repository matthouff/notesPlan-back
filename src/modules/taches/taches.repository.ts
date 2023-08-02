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

  async findByGroupeId(groupeId: string) {
    const data = await this.model.findBy({ groupe: { id: groupeId } });
    return data;

    // try {
    //   return await this.model.find({ where: { groupe: { id: id_groupe } } });
    // } catch (error) {
    //   // Gérer les erreurs
    //   console.error(error);
    //   throw new Error("Erreur lors de la récupération des notes.");
    // }
  }
}
