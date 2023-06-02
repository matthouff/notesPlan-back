import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tache } from './entity/taches';
import { TacheController } from './taches.controller';
import { TacheRepository } from './taches.repository';
import { tacheService } from './taches.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tache])],
  exports: [TypeOrmModule],
  controllers: [TacheController],
  providers: [tacheService, TacheRepository]
})
export class TacheModule { }
