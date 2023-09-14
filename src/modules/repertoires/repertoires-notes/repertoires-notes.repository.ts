import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { RepositoryStarter } from 'src/modules/repository-starter.class';
import { DataSource } from 'typeorm';
import { RepertoireNote } from './entity/repertoires-notes';

@Injectable()
export class RepertoiresNotesRepository extends RepositoryStarter<RepertoireNote> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(RepertoireNote));
  }

  /**
   * Vérifie si un répertoire de notes avec un libellé spécifique existe dans la base de données.
   * @param libelle Le libellé du répertoire de notes à rechercher.
   * @returns Une valeur booléenne indiquant si le répertoire de notes existe ou non.
   */
  async findByNom(libelle: string) {
    return await this.model.exist({ where: { libelle } });
  }

  /**
   * Récupère tous les répertoires de notes associés à un utilisateur spécifique.
   * @param userId L'identifiant de l'utilisateur dont les répertoires de notes sont recherchés.
   * @returns Une liste de répertoires de notes associés à l'utilisateur.
   */
  async findByUserId(userId: string) {
    const data = await this.model.findBy({ user: { id: userId } });
    return data;
  }
}
