import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  /**
   * Méthode canActivate pour l'implémentation de l'interface CanActivate.
   * Cette méthode est appelée lorsqu'une route est activée pour vérifier si l'utilisateur est authentifié.
   *
   * @param context L'objet ExecutionContext contenant des informations sur la requête en cours.
   * @returns Une promesse booléenne indiquant si l'utilisateur est authentifié.
   * @throws UnauthorizedException Si l'utilisateur n'est pas authentifié ou si le token est invalide.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  /**
   * Extrait le token JWT du cookie d'en-tête de la requête.
   *
   * @param request L'objet Request de la requête HTTP.
   * @returns Le token JWT extrait du cookie ou null s'il n'est pas présent.
   */
  private extractTokenFromHeader(request: Request): string | null {
    return request.cookies['jwt'] ?? null;
  }
}
