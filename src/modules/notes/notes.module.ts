import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entity/notes';
import { NoteController } from './notes.controller';
import { NoteRepository } from './notes.repository';
import { NoteService } from './notes.service';
import { RepertoireNote } from '../repertoires/repertoires-notes/entity/repertoires-notes';
import { RepertoireNotesModule } from '../repertoires/repertoires-notes/repertoires-notes.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Note, RepertoireNote]), RepertoireNotesModule, AuthModule],
  exports: [TypeOrmModule],
  controllers: [NoteController],
  providers: [NoteService, NoteRepository]
})
export class NoteModule { }
