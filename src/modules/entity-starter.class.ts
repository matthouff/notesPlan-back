import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export interface IEntityStarter {
	readonly id: string;
	readonly createdAt: Date;
	updatedAt?: Date;
}

export class EntityStarter implements IEntityStarter {
	@PrimaryGeneratedColumn("uuid")
	readonly id: string;

	@CreateDateColumn()
	readonly createdAt: Date;

	@UpdateDateColumn()
	updatedAt?: Date;

	get starterValues(): IEntityStarter {
		return {
			id: this.id,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
