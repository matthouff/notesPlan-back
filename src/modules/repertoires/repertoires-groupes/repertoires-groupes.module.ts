import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Repertoire } from "../commun/entity/repertoires";
import { RepertoireGroupe } from "./entity/repertoires-groupes";
import { RepertoiresGroupesController } from "./repertoires-groupes.controller";
import { RepertoiresGroupesRepository } from "./repertoires-groupes.repository";
import { RepertoiresGroupesService } from "./repertoires-groupes.service";


@Module({
  imports: [TypeOrmModule.forFeature([RepertoireGroupe])],
  exports: [TypeOrmModule],
  controllers: [RepertoiresGroupesController],
  providers: [RepertoiresGroupesService, RepertoiresGroupesRepository]
})
export class RepertoireGroupesModule { }
