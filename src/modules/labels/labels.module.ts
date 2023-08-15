import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './entity/labels';
import { LabelController } from './labels.controller';
import { LabelRepository } from './labels.repository';
import { LabelService } from './labels.service';
import { TacheRepository } from '../taches/taches.repository';
import { RepertoiresGroupeActions } from '../repertoires/repertoires-groupes/repertoires-groupes.actions';
import { RepertoireGroupesModule } from '../repertoires/repertoires-groupes/repertoires-groupes.module';
import { RepertoiresGroupesRepository } from '../repertoires/repertoires-groupes/repertoires-groupes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Label]), RepertoireGroupesModule],
  exports: [TypeOrmModule],
  controllers: [LabelController],
  providers: [LabelService, LabelRepository, TacheRepository, RepertoiresGroupesRepository, Logger]
})
export class LabelModule { }
