import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { RepertoireGroupe } from "./entity/repertoires-groupes";
import { RepertoiresGroupesRepository } from "./repertoires-groupes.repository";

@Injectable()
export class RepertoiresGroupeActions {
	constructor(private readonly repertoiresRepository: RepertoiresGroupesRepository, private readonly logger: Logger) { }

	/**
	 * Récupère un répertoire de groupe par son identifiant.
	 * @param id L'identifiant du répertoire à récupérer.
	 * @returns Le répertoire de groupe trouvé.
	 * @throws NotFoundException si le répertoire n'est pas trouvé.
	 */
	async getrepertoiresById(id: string): Promise<RepertoireGroupe> {
		const found = await this.repertoiresRepository.findByID(id);

		if (!found) {
			this.logger.debug(`Aucun repertoires n'a été récupéré pour l'id "${id}"`);
			throw new NotFoundException(`Aucun repertoires n'a été récupéré pour l'id "${id}"`);
		}

		this.logger.debug(`Le repertoires a été récupéré`);

		return found;
	}

	/**
	 * Sauvegarde un répertoire de groupe dans la base de données.
	 * @param repertoiresEntity L'entité du répertoire de groupe à sauvegarder.
	 * @returns Le répertoire de groupe sauvegardé.
	 */
	async saverepertoiresToDatabase(repertoiresEntity: RepertoireGroupe): Promise<RepertoireGroupe> {
		const repertoires = await this.repertoiresRepository.save(repertoiresEntity);

		this.logger.debug(`Le repertoires a été sauvegardé dans la base de données`);

		return repertoires;
	}
}
