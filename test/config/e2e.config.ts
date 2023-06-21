import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { AppModule } from "../../src/app.module";
import { DatabaseService } from "../../src/database/database.service";
import { TestDatabaseService } from "../database/test-database.service";

/**
 * Initialise une application NestJS pour les tests.
 *
 * @returns Une promesse qui résout avec l'instance de l'application initialisée.
 */
export async function initializeTestApp(): Promise<INestApplication> {
	// Crée un module de test pour AppModule avec Test.createTestingModule
	// et substitue la classe DatabaseService par TestDatabaseService.
	const moduleFixture = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideProvider(DatabaseService)
		.useClass(TestDatabaseService)
		.compile();

	// Crée une instance de l'application NestJS avec le moduleFixture créé.
	const nestApp = moduleFixture.createNestApplication();

	// Applique un pipe global de validation pour valider les entrées des requêtes.
	nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	// Initialise l'application.
	await nestApp.init();

	// Renvoie l'instance de l'application initialisée.
	return nestApp;
}

/**
 * Ferme la connexion à l'application et détruit la base de données de la source de données associée.
 * @param nestApp Instance de l'application INestApplication
 * @returns Une promesse qui se résout lorsque la connexion à l'application et la base de données ont été fermées avec succès
 */
export async function closeTestAppConnexion(nestApp: INestApplication): Promise<void> {
	const datasource = nestApp.get<DataSource>(DataSource);

	await datasource.dropDatabase();

	await datasource.destroy();
	await nestApp.close();
}
