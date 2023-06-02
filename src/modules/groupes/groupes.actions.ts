import { Logger } from "@nestjs/common";
import { Groupe } from "./entity/groupes";
import { GroupesRepository } from "./groupes.repository";


export class GroupeActions {
	constructor(private readonly groupeRepository: GroupesRepository, private readonly logger: Logger) { }


	//
	// Update le Groupe ciblé avec Groupe et IGroupeEditor passé en paramettre
	//
	// updateGroupeValidation(Groupe: Groupe, updateGroupeDto: IGroupeEditor): Groupe {
	// 	const data: IGroupeEditor = {
	// 		...updateGroupeDto,
	// 	};

	// 	Groupe.edit(data);

	// 	this.logger.debug(`Le Groupe a été mis à jour`);

	// 	return Groupe;
	// }

	//
	// On récupère le Groupe avec l'id passé en parametre
	//
	// async getGroupeById(id: string): Promise<Groupe> {
	// 	const found = await this.GroupeRepository.findByID(id);

	// 	if (!found) {
	// 		this.logger.debug(`Aucun Groupe n'a été récupéré pour l'id "${id}"`);
	// 		throw new NotFoundException(`Aucun Groupe n'a été récupéré pour l'id "${id}"`);
	// 	}

	// 	this.logger.debug(`Le Groupe a été récupéré`);

	// 	return found;
	// }

	// async removeGroupeById(id: string): Promise<boolean> {
	// 	const deleted = await this.GroupeRepository.deleteByID(id);

	// 	this.logger.debug(`Le Groupe a été supprimé`);

	// 	return deleted;
	// }

	async saveGroupeToDatabase(groupeEntity: Groupe): Promise<Groupe> {
		const groupe = await this.groupeRepository.save(groupeEntity);

		this.logger.debug(`Le groupe a été sauvegardé dans la base de données`);

		return groupe;
	}
}
