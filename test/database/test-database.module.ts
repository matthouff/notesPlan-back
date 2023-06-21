import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TestDatabaseService } from "./test-database.service";

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useClass: TestDatabaseService,
		}),
	],
	providers: [TestDatabaseService, ConfigService],
	exports: [TestDatabaseModule, TestDatabaseService],
})
export class TestDatabaseModule {}
