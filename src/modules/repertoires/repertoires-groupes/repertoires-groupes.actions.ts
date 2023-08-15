import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { RepertoireGroupe } from "./entity/repertoires-groupes";
import { RepertoiresGroupesRepository } from "./repertoires-groupes.repository";

@Injectable()
export class RepertoiresGroupeActions {
	constructor(private readonly repertoiresRepository: RepertoiresGroupesRepository, private readonly logger: Logger) { }

	async getrepertoiresById(id: string): Promise<RepertoireGroupe> {
		const found = await this.repertoiresRepository.findByID(id);

		if (!found) {
			this.logger.debug(`Aucun repertoires n'a été récupéré pour l'id "${id}"`);
			throw new NotFoundException(`Aucun repertoires n'a été récupéré pour l'id "${id}"`);
		}

		this.logger.debug(`Le repertoires a été récupéré`);

		return found;
	}

	// async removerepertoiresById(id: string): Promise<boolean> {
	// 	const deleted = await this.repertoiresRepository.deleteByID(id);

	// 	this.logger.debug(`Le repertoires a été supprimé`);

	// 	return deleted;
	// }

	async saverepertoiresToDatabase(repertoiresEntity: RepertoireGroupe): Promise<RepertoireGroupe> {
		const repertoires = await this.repertoiresRepository.save(repertoiresEntity);

		this.logger.debug(`Le repertoires a été sauvegardé dans la base de données`);

		return repertoires;
	}
}
