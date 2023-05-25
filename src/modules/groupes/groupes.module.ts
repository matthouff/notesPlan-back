import { Module } from '@nestjs/common';
import { GroupesController } from './groupes.controller';
import { GroupesService } from './groupes.service';

@Module({
  controllers: [GroupesController],
  providers: [GroupesService]
})
export class GroupesModule {}
