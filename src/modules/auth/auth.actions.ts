import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthActions {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService
  ) { }

  async getUser(request: Request) {
    const cookie = request.cookies['jwt'];
    if (!cookie) {
      throw new UnauthorizedException();
    }

    const decodedToken = await this.jwtService.verifyAsync(cookie);
    if (!decodedToken) {
      throw new UnauthorizedException();
    }

    const user = await this.authService.findOneById(decodedToken.id)
    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...userData } = user;
    return userData;
  }
}
