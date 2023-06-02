import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Groupe } from './entity/groupes';
import { GroupeController } from './groupes.controller';
import { GroupesRepository } from './groupes.repository';
import { GroupeService } from './groupes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Groupe])],
  exports: [TypeOrmModule],
  controllers: [GroupeController],
  providers: [GroupeService, GroupesRepository]
})
export class GroupeModule { }
