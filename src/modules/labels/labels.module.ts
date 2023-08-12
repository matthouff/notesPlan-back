import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './entity/labels';
import { LabelController } from './labels.controller';
import { LabelRepository } from './labels.repository';
import { LabelService } from './labels.service';
import { TacheRepository } from '../taches/taches.repository';
import { TacheModule } from '../taches/taches.module';
import { TacheService } from '../taches/taches.service';

@Module({
  imports: [TypeOrmModule.forFeature([Label])],
  exports: [TypeOrmModule],
  controllers: [LabelController],
  providers: [LabelService, LabelRepository, TacheRepository, Logger]
})
export class LabelModule { }
