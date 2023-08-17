import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Tache } from "./entity/taches";
import { TacheRepository } from "./taches.repository";

@Injectable()
export class TacheActions {
	constructor(private readonly tacheRepository: TacheRepository, private readonly logger: Logger) { }

	async getTacheById(id: string): Promise<Tache> {
		const found = await this.tacheRepository.findByID(id);

		if (!found) {
			this.logger.debug(`Aucune tâche n'a été récupérée pour l'id "${id}"`);
			throw new NotFoundException(`Aucune tâche n'a été récupérée pour l'id "${id}"`);
		}

		this.logger.debug(`La tâche a été récupérée`);

		return found;
	}


	async savetacheToDatabase(tacheEntity: Tache): Promise<Tache> {
		const tache = await this.tacheRepository.save(tacheEntity);

		this.logger.debug(`La tâche a été sauvegardée dans la base de données`);

		return tache;
	}
}
