import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RepertoireNote } from "./entity/repertoires-notes";
import { RepertoiresNotesController } from "./repertoires-notes.controller";
import { RepertoiresNotesRepository } from "./repertoires-notes.repository";
import { RepertoiresNotesService } from "./repertoires-notes.service";


@Module({
  imports: [TypeOrmModule.forFeature([RepertoireNote])],
  exports: [TypeOrmModule],
  controllers: [RepertoiresNotesController],
  providers: [RepertoiresNotesService, RepertoiresNotesRepository]
})
export class RepertoireNotesModule { }
