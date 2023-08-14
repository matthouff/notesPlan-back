import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/users-create.dto';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) { }


  /////////   CONNEXION D'UN USER ////////////

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body("email") email: string, @Body("password") password: string, @Res({ passthrough: true }) response: Response, @Req() request: Request) {
    const user = await this.authService.findOneByEmail(email);

    console.log(user);

    if (!user) {
      throw new BadRequestException("Donnée invalide");
    }
    if (!await bcrypt.compare(password, user.password)) {
      throw new BadRequestException("Donnée invalide");
    }

    // Création du JWTTokent
    const jwt = await this.jwtService.signAsync({ id: user.id })

    response.cookie('jwt', jwt, { httpOnly: true })
    // httpOnly permet de sécuriser le cookie et devient inaxessible depuis JavaScript côté client

    return {
      message: "success",
    };
  }


  /////////   AJOUT D'UN NOUVEAU USER ////////////

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() userDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(userDto.password, 12)

    const user = this.authService.register({
      email: userDto.email,
      password: hashedPassword
    });

    // Enlève le password de la réponse
    delete (await user).password

    return user;
  }


  /////////   RÉCUPÉRATION DU USER ////////////

  @Get('user')
  async user(@Req() req: Request) {

    try {
      const cookie = req.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }

      const user = await this.authService.findOneById(data.id)

      // Enlève le password de la réponse
      const { password, ...result } = user;

      return result;

    } catch (e) {
      throw new UnauthorizedException();
    }

  }


  /////////   DÉCONNEXION DU USER ////////////

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    // Suppression du cookie jwt en cours
    res.clearCookie("jwt")

    return {
      message: "delete success"
    }
  }
}
