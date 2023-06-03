import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { RepositoryStarter } from "src/modules/repository-starter.class";
import { DataSource } from "typeorm";
import { Label } from "./entity/labels";

@Injectable()
export class LabelRepository extends RepositoryStarter<Label> {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(datasource.getRepository(Label));
  }
}
