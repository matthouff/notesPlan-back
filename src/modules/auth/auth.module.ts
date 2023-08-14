import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy'; // Importez la stratégie JWT
import { jwtConstants } from './constants';
import { UserRepository } from '../users/users.repository';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, UserRepository], // Ajoutez JwtStrategy aux fournisseurs
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
