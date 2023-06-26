import { Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import configSchema from "../config/config.schema";
import configValidator from "../config/config.validator";
import { DatabaseService } from "./database.service";

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: true,
			isGlobal: true,
			load: [configSchema],
			validationSchema: configValidator,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: "postgres",
				host: configService.get("DATABASE_HOST"),
				port: +configService.get("DATABASE_PORT"),
				username: configService.get("DATABASE_USER"),
				password: configService.get("DATABASE_PASSWORD"),
				database: configService.get("DATABASE_NAME"),
				synchronize: configService.get("NODE_ENV") !== "production",
				autoLoadEntities: true,
				retryAttempts: 3,
				entitySkipConstructor: true,
				logging: configService.get("NODE_ENV") === "production" ? "all" : undefined,
			}),
			inject: [ConfigService],
		}),
	],
	providers: [DatabaseService],
	exports: [DatabaseService],
})
export class DatabaseModule implements NestModule {
	configure() {}
}
