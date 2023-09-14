import { Logger } from "@nestjs/common";
import { Label } from "./entity/labels";
import { LabelRepository } from "./labels.repository";


export class LabelActions {
	constructor(private readonly labelRepository: LabelRepository, private readonly logger: Logger) { }

	/**
	 * Sauvegarde un label dans la base de données.
	 *
	 * @param labelEntity L'objet Label à sauvegarder.
	 * @returns Une promesse résolue avec l'objet Label sauvegardé.
	 */
	async savelabelToDatabase(labelEntity: Label): Promise<Label> {
		const label = await this.labelRepository.save(labelEntity);

		this.logger.debug(`Le label a été sauvegardé dans la base de données`);

		return label;
	}
}
