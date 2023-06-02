import { Logger } from "@nestjs/common";
import { Label } from "./entity/labels";
import { LabelRepository } from "./labels.repository";


export class LabelActions {
	constructor(private readonly labelRepository: LabelRepository, private readonly logger: Logger) { }


	//
	// Update le label ciblé avec label et IlabelEditor passé en paramettre
	//
	// updatelabelValidation(label: label, updatelabelDto: IlabelEditor): label {
	// 	const data: IlabelEditor = {
	// 		...updatelabelDto,
	// 	};

	// 	label.edit(data);

	// 	this.logger.debug(`Le label a été mis à jour`);

	// 	return label;
	// }

	//
	// On récupère le label avec l'id passé en parametre
	//
	// async getlabelById(id: string): Promise<label> {
	// 	const found = await this.labelRepository.findByID(id);

	// 	if (!found) {
	// 		this.logger.debug(`Aucun label n'a été récupéré pour l'id "${id}"`);
	// 		throw new NotFoundException(`Aucun label n'a été récupéré pour l'id "${id}"`);
	// 	}

	// 	this.logger.debug(`Le label a été récupéré`);

	// 	return found;
	// }

	// async removelabelById(id: string): Promise<boolean> {
	// 	const deleted = await this.labelRepository.deleteByID(id);

	// 	this.logger.debug(`Le label a été supprimé`);

	// 	return deleted;
	// }

	async savelabelToDatabase(labelEntity: Label): Promise<Label> {
		const label = await this.labelRepository.save(labelEntity);

		this.logger.debug(`Le label a été sauvegardé dans la base de données`);

		return label;
	}
}
