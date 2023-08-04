import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Tache } from "./entity/taches";
import { TacheRepository } from "./taches.repository";

@Injectable()
export class TacheActions {
	constructor(private readonly tacheRepository: TacheRepository, private readonly logger: Logger) { }


	//
	// Update le tache ciblé avec tache et ItacheEditor passé en paramettre
	//
	// updatetacheValidation(tache: tache, updatetacheDto: ItacheEditor): tache {
	// 	const data: ItacheEditor = {
	// 		...updatetacheDto,
	// 	};

	// 	tache.edit(data);

	// 	this.logger.debug(`Le tache a été mis à jour`);

	// 	return tache;
	// }

	//
	// On récupère le tache avec l'id passé en parametre

	async getTacheById(id: string): Promise<Tache> {
		const found = await this.tacheRepository.findByID(id);

		if (!found) {
			this.logger.debug(`Aucun tache n'a été récupéré pour l'id "${id}"`);
			throw new NotFoundException(`Aucun tache n'a été récupéré pour l'id "${id}"`);
		}

		this.logger.debug(`Le tache a été récupéré`);

		return found;
	}

	// async removetacheById(id: string): Promise<boolean> {
	// 	const deleted = await this.tacheRepository.deleteByID(id);

	// 	this.logger.debug(`Le tache a été supprimé`);

	// 	return deleted;
	// }

	async savetacheToDatabase(tacheEntity: Tache): Promise<Tache> {
		const tache = await this.tacheRepository.save(tacheEntity);

		this.logger.debug(`Le tache a été sauvegardé dans la base de données`);

		return tache;
	}
}
