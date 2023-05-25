import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export interface IEntityStarter {
	readonly id: string;
	readonly createdat: Date;
	updatedat?: Date;
}

export class EntityStarter implements IEntityStarter {
	@PrimaryGeneratedColumn("uuid")
	readonly id: string;

	@CreateDateColumn()
	readonly createdat: Date;

	@UpdateDateColumn()
	updatedat?: Date;

	get starterValues(): IEntityStarter {
		return {
			id: this.id,
			createdat: this.createdat,
			updatedat: this.updatedat,
		};
	}
}
