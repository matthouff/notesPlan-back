import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtConstants } from './constants';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  /**
   * Méthode de validation du token JWT.
   *
   * @param payload Le payload (contenu) du token JWT.
   * @returns L'utilisateur associé au token s'il existe.
   * @throws UnauthorizedException Si l'utilisateur associé au token n'est pas trouvé.
   */
  async validate(payload: string) {
    const user = await this.usersService.findById(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
