import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Groupe } from './entity/groupes';
import { GroupeController } from './groupes.controller';
import { GroupesRepository } from './groupes.repository';
import { GroupeService } from './groupes.service';
import { RepertoireGroupesModule } from '../repertoires/repertoires-groupes/repertoires-groupes.module';
import { GroupeActions } from './groupes.actions';
import { TacheRepository } from '../taches/taches.repository';
import { TacheModule } from '../taches/taches.module';

@Module({
  imports: [TypeOrmModule.forFeature([Groupe]), RepertoireGroupesModule],
  exports: [TypeOrmModule, GroupeActions],
  controllers: [GroupeController],
  providers: [GroupeService, GroupesRepository, GroupeActions, Logger, TacheRepository]
})
export class GroupeModule { }
