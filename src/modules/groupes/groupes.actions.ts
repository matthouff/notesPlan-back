import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Groupe } from "./entity/groupes";
import { GroupesRepository } from "./groupes.repository";

@Injectable()
export class GroupeActions {
	constructor(private readonly groupeRepository: GroupesRepository, private readonly logger: Logger) { }

	async getGroupeById(id: string): Promise<Groupe> {
		const found = await this.groupeRepository.findByID(id);

		if (!found) {
			this.logger.debug(`Aucun Groupe n'a été récupéré pour l'id "${id}"`);
			throw new NotFoundException(`Aucun Groupe n'a été récupéré pour l'id "${id}"`);
		}

		this.logger.debug(`Le Groupe a été récupéré`);

		return found;
	}

	async saveGroupeToDatabase(groupeEntity: Groupe): Promise<Groupe> {
		const groupe = await this.groupeRepository.save(groupeEntity);

		this.logger.debug(`Le groupe a été sauvegardé dans la base de données`);

		return groupe;
	}
}
