import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { RepositoryStarter } from "../repository-starter.class";
import { User } from "./entity/users";

@Injectable()
export class userRepository extends RepositoryStarter<User> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(User));
  }
}
