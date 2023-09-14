import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RepertoireNote } from './entity/repertoires-notes';
import { RepertoiresNotesRepository } from './repertoires-notes.repository';

@Injectable()
export class RepertoiresActions {
  constructor(
    private readonly repertoiresRepository: RepertoiresNotesRepository,
    private readonly logger: Logger,
  ) { }

  /**
   * Récupère un répertoire de notes par son identifiant.
   * @param id L'identifiant du répertoire à récupérer.
   * @returns Le répertoire de notes correspondant à l'identifiant.
   * @throws NotFoundException si le répertoire n'est pas trouvé.
   */
  async getrepertoiresById(id: string): Promise<RepertoireNote> {
    const found = await this.repertoiresRepository.findByID(id);

    if (!found) {
      this.logger.debug(`Aucun repertoires n'a été récupéré pour l'id "${id}"`);
      throw new NotFoundException(
        `Aucun repertoires n'a été récupéré pour l'id "${id}"`,
      );
    }

    this.logger.debug(`Le repertoires a été récupéré`);

    return found;
  }

  /**
   * Sauvegarde un répertoire de notes dans la base de données.
   * @param repertoiresEntity Le répertoire de notes à sauvegarder.
   * @returns Le répertoire de notes sauvegardé.
  */
  async saverepertoiresToDatabase(
    repertoiresEntity: RepertoireNote,
  ): Promise<RepertoireNote> {
    const repertoires = await this.repertoiresRepository.save(
      repertoiresEntity,
    );

    this.logger.debug(
      `Le repertoires a été sauvegardé dans la base de données`,
    );

    return repertoires;
  }
}
