import { Logger } from "@nestjs/common";
import { Repertoire } from "../commun/entity/repertoires";
import { RepertoireGroupe } from "./entity/repertoires-groupes";
import { RepertoiresGroupesRepository } from "./repertoires-groupes.repository";


export class RepertoiresActions {
	constructor(private readonly repertoiresRepository: RepertoiresGroupesRepository, private readonly logger: Logger) { }


	//
	// Update le repertoires ciblé avec repertoires et IrepertoiresEditor passé en paramettre
	//
	// updaterepertoiresValidation(repertoires: repertoires, updaterepertoiresDto: IrepertoiresEditor): repertoires {
	// 	const data: IrepertoiresEditor = {
	// 		...updaterepertoiresDto,
	// 	};

	// 	repertoires.edit(data);

	// 	this.logger.debug(`Le repertoires a été mis à jour`);

	// 	return repertoires;
	// }

	//
	// On récupère le repertoires avec l'id passé en parametre
	//
	// async getrepertoiresById(id: string): Promise<repertoires> {
	// 	const found = await this.repertoiresRepository.findByID(id);

	// 	if (!found) {
	// 		this.logger.debug(`Aucun repertoires n'a été récupéré pour l'id "${id}"`);
	// 		throw new NotFoundException(`Aucun repertoires n'a été récupéré pour l'id "${id}"`);
	// 	}

	// 	this.logger.debug(`Le repertoires a été récupéré`);

	// 	return found;
	// }

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
