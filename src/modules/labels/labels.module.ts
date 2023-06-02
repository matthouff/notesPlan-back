import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './entity/labels';
import { LabelController } from './labels.controller';
import { LabelRepository } from './labels.repository';
import { LabelService } from './labels.service';

@Module({
  imports: [TypeOrmModule.forFeature([Label])],
  exports: [TypeOrmModule],
  controllers: [LabelController],
  providers: [LabelService, LabelRepository]
})
export class LabelModule { }
