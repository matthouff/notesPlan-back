import { Logger } from "@nestjs/common";
import { User } from "./entity/users";
import { userRepository } from "./users.repository";


export class ParametrageActions {
	constructor(private readonly parametrageRepository: userRepository, private readonly logger: Logger) { }


	//
	// Update le parametrage ciblé avec Parametrage et IParametrageEditor passé en paramettre
	//
	// updateParametrageValidation(parametrage: Parametrage, updateParametrageDto: IParametrageEditor): Parametrage {
	// 	const data: IParametrageEditor = {
	// 		...updateParametrageDto,
	// 	};

	// 	parametrage.edit(data);

	// 	this.logger.debug(`Le parametrage a été mis à jour`);

	// 	return parametrage;
	// }

	//
	// On récupère le parametrage avec l'id passé en parametre
	//
	// async getParametrageById(id: string): Promise<Parametrage> {
	// 	const found = await this.parametrageRepository.findByID(id);

	// 	if (!found) {
	// 		this.logger.debug(`Aucun parametrage n'a été récupéré pour l'id "${id}"`);
	// 		throw new NotFoundException(`Aucun parametrage n'a été récupéré pour l'id "${id}"`);
	// 	}

	// 	this.logger.debug(`Le parametrage a été récupéré`);

	// 	return found;
	// }

	// async removeParametrageById(id: string): Promise<boolean> {
	// 	const deleted = await this.parametrageRepository.deleteByID(id);

	// 	this.logger.debug(`Le parametrage a été supprimé`);

	// 	return deleted;
	// }

	async saveParametrageToDatabase(parametrageEntity: User): Promise<User> {
		const parametrage = await this.parametrageRepository.save(parametrageEntity);

		this.logger.debug(`Le parametrage a été sauvegardé dans la base de données`);

		return parametrage;
	}
}
