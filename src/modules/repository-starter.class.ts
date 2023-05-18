import { In, Repository } from "typeorm";

/**
 * Interface représentant les méthodes par repository
 */
export interface IRepositoryStarterMethods<ENTITY> {
	/** Récupération d'un élément par son identifiant depuis la base de données */
	findByID(id: string): Promise<ENTITY | undefined>;
	/** Récupération d'une liste d'éléments par identifiant depuis la base de données */
	findManyByID(listId: string[]): Promise<ENTITY[]>;
	/** Sauvegarde de l'éléments dans base de données */
	save(data: ENTITY): Promise<ENTITY>;
	/** Sauvegarde multiple des éléments dans la base de données */
	saveMany(data: ENTITY[]): Promise<ENTITY[]>;
	/** Suppression de l'élément dans la base de données à partir de son identifiant */
	deleteByID(id: string): Promise<boolean>;
	/** Suppression multiple des éléments dans la base de données à partir de leur identifiant */
	deleteManyByID(listId: string[]): Promise<boolean>;
	/** Récupération de tous les éléments depuis la base de données */
	getAll(): Promise<ENTITY[]>;
}

export class RepositoryStarter<ENTITY> {
	protected constructor(protected model: Repository<ENTITY>) { }

	async save(data: ENTITY): Promise<ENTITY> {
		const created = await this.model.save(data);

		return created;
	}

	async saveMany(list: ENTITY[]): Promise<ENTITY[]> {
		const created = await this.model.save(list);

		return created;
	}

	async findByID(id: string): Promise<ENTITY | undefined> {
		// @ts-ignore
		const found = await this.model.findOneBy({ id });

		return found || undefined;
	}

	async findManyByID(listId: string[]): Promise<ENTITY[]> {
		// @ts-ignore
		const found = await this.model.find({ where: { id: In(listId) } });

		return found;
	}

	async deleteByID(id: string): Promise<boolean> {
		const deleted = await this.model.delete(id);

		return !!deleted.affected;
	}

	async deleteManyByID(listId: string[]): Promise<boolean> {
		const deleted = await this.model.delete(listId);

		return !!deleted.affected;
	}

	async getAll(): Promise<ENTITY[]> {
		const data = await this.model.find();

		return data;
	}
}
