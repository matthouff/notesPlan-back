import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepertoireNote } from './entity/repertoires-notes';
import { RepertoiresNotesController } from './repertoires-notes.controller';
import { RepertoiresNotesRepository } from './repertoires-notes.repository';
import { RepertoiresNotesService } from './repertoires-notes.service';
import { UsersModule } from 'src/modules/users/users.module';
import { User } from 'src/modules/users/entity/users';
import { RepertoiresActions } from './repertoires-notes.actions';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthActions } from 'src/modules/auth/auth.actions';

@Module({
  imports: [TypeOrmModule.forFeature([RepertoireNote, User]), UsersModule, AuthModule],
  exports: [TypeOrmModule, RepertoiresActions],
  controllers: [RepertoiresNotesController],
  providers: [RepertoiresNotesService, RepertoiresNotesRepository, RepertoiresActions, AuthActions, Logger],
})
export class RepertoireNotesModule { }
