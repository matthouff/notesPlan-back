import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class DatabaseService {
	constructor(@InjectDataSource() private readonly connection: DataSource) {}

	getDbHandle(): DataSource {
		return this.connection;
	}
}
