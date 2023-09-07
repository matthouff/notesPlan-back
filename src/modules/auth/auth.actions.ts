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

  async getUser(token: string) {

    console.log(token);

    if (!token) {
      throw new UnauthorizedException();
    }

    const decodedToken = await this.jwtService.verifyAsync(token);
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
