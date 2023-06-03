import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entity/notes';
import { NoteController } from './notes.controller';
import { NoteRepository } from './notes.repository';
import { NoteService } from './notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note])],
  exports: [TypeOrmModule],
  controllers: [NoteController],
  providers: [NoteService, NoteRepository]
})
export class NoteModule { }
