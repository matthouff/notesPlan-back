import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { RepertoireGroupesModule } from './modules/repertoires/repertoires-groupes/repertoires-groupes.module';
import { RepertoireNotesModule } from './modules/repertoires/repertoires-notes/repertoires-notes.module';
import { GroupeModule } from './modules/groupes/groupes.module';
import { TacheModule } from './modules/taches/taches.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'souviensToi',
    autoLoadEntities: true,
    synchronize: true,
  }), RepertoireGroupesModule, RepertoireNotesModule, GroupeModule, TacheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { } 
