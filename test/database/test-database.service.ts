import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { StringCleanupSubscriber } from "src/database/subscriber/string-cleanup.subscriber";

@Injectable()
export class TestDatabaseService implements TypeOrmOptionsFactory {
	/**
	 * Méthode contenant toutes les options de connexion de la base de données de tests
	 * @returns { Promise<TypeOrmModuleOptions> } Des options de connexion.
	 */
	async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
		return {
			type: "postgres",
			username: process.env.TEST_DATABASE_USER,
			host: process.env.TEST_DATABASE_HOST,
			port: Number(process.env.TEST_DATABASE_PORT),
			database: process.env.TEST_DATABASE_NAME,
			password: process.env.TEST_DATABASE_PASSWORD,
			autoLoadEntities: true,
			entitySkipConstructor: true,
			synchronize: true,
			dropSchema: true,
			retryAttempts: 0,
			subscribers: [StringCleanupSubscriber],
		};
	}
}
