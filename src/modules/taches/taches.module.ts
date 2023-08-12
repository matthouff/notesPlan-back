import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tache } from './entity/taches';
import { TacheController } from './taches.controller';
import { TacheRepository } from './taches.repository';
import { TacheService } from './taches.service';
import { TacheActions } from './taches.actions';
import { GroupeModule } from '../groupes/groupes.module';
import { LabelRepository } from '../labels/labels.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Tache]), GroupeModule],
  exports: [TypeOrmModule, TacheActions],
  controllers: [TacheController],
  providers: [TacheService, TacheRepository, TacheActions, Logger, LabelRepository]
})
export class TacheModule { }
