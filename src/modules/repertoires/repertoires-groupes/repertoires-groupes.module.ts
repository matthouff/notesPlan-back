import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Repertoire } from "../commun/entity/repertoires";
import { RepertoireGroupe } from "./entity/repertoires-groupes";
import { RepertoiresGroupesController } from "./repertoires-groupes.controller";
import { RepertoiresGroupesRepository } from "./repertoires-groupes.repository";
import { RepertoiresGroupesService } from "./repertoires-groupes.service";
import { RepertoiresGroupeActions } from "./repertoires-groupes.actions";
import { UsersModule } from "src/modules/users/users.module";


@Module({
  imports: [TypeOrmModule.forFeature([RepertoireGroupe]), UsersModule],
  exports: [TypeOrmModule, RepertoiresGroupeActions],
  controllers: [RepertoiresGroupesController],
  providers: [RepertoiresGroupesService, RepertoiresGroupesRepository, RepertoiresGroupeActions, Logger]
})
export class RepertoireGroupesModule { }
