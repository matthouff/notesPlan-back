import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { RepertoireGroupesModule } from './modules/repertoires/repertoires-groupes/repertoires-groupes.module';
import { RepertoireNotesModule } from './modules/repertoires/repertoires-notes/repertoires-notes.module';
import { GroupeModule } from './modules/groupes/groupes.module';
import { TacheModule } from './modules/taches/taches.module';
import { LabelModule } from './modules/labels/labels.module';
import { NoteModule } from './modules/notes/notes.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    RepertoireGroupesModule,
    RepertoireNotesModule,
    GroupeModule,
    TacheModule,
    LabelModule,
    NoteModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
