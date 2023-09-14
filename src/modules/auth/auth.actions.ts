import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthActions {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) { }

  /**
   * Récupère les informations de l'utilisateur à partir d'un token JWT valide.
   *
   * @param token Le token JWT à vérifier et à décoder.
   * @returns Les données de l'utilisateur (à l'exception du mot de passe) si l'authentification est réussie.
   * @throws UnauthorizedException Si le token est manquant, invalide, expiré ou si l'utilisateur n'est pas trouvé.
   */
  async getUser(token: string) {
    if (!token) {
      throw new UnauthorizedException();
    }

    const decodedToken = await this.jwtService.verifyAsync(token);
    if (!decodedToken) {
      throw new UnauthorizedException();
    }

    const user = await this.authService.findOneById(decodedToken.id);
    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...userData } = user;
    return userData;
  }
}
