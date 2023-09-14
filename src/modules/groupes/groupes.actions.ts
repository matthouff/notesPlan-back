import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Groupe } from "./entity/groupes";
import { GroupesRepository } from "./groupes.repository";

@Injectable()
export class GroupeActions {
	constructor(private readonly groupeRepository: GroupesRepository, private readonly logger: Logger) { }

	/**
	 * Récupère un groupe à partir de son identifiant (ID).
	 *
	 * @param id L'identifiant du groupe à récupérer.
	 * @returns Le groupe récupéré.
	 * @throws NotFoundException Si aucun groupe n'est trouvé avec l'identifiant spécifié.
	 */
	async getGroupeById(id: string): Promise<Groupe> {
		const found = await this.groupeRepository.findByID(id);

		if (!found) {
			this.logger.debug(`Aucun Groupe n'a été récupéré pour l'id "${id}"`);
			throw new NotFoundException(`Aucun Groupe n'a été récupéré pour l'id "${id}"`);
		}

		this.logger.debug(`Le Groupe a été récupéré`);

		return found;
	}

	/**
	 * Sauvegarde un groupe dans la base de données.
	 *
	 * @param groupeEntity L'entité du groupe à sauvegarder.
	 * @returns Le groupe sauvegardé dans la base de données.
	 */
	async saveGroupeToDatabase(groupeEntity: Groupe): Promise<Groupe> {
		const groupe = await this.groupeRepository.save(groupeEntity);

		this.logger.debug(`Le groupe a été sauvegardé dans la base de données`);

		return groupe;
	}
}
