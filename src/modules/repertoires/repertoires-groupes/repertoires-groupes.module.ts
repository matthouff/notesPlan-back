import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RepertoireGroupe } from "./entity/repertoires-groupes";
import { RepertoiresGroupesController } from "./repertoires-groupes.controller";
import { RepertoiresGroupesRepository } from "./repertoires-groupes.repository";
import { RepertoiresGroupesService } from "./repertoires-groupes.service";
import { RepertoiresGroupeActions } from "./repertoires-groupes.actions";
import { UsersModule } from "src/modules/users/users.module";
import { AuthModule } from "src/modules/auth/auth.module";
import { AuthActions } from "src/modules/auth/auth.actions";


@Module({
  imports: [TypeOrmModule.forFeature([RepertoireGroupe]), UsersModule, AuthModule],
  exports: [TypeOrmModule, RepertoiresGroupeActions],
  controllers: [RepertoiresGroupesController],
  providers: [RepertoiresGroupesService, RepertoiresGroupesRepository, RepertoiresGroupeActions, AuthActions, Logger]
})
export class RepertoireGroupesModule { }
