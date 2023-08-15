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
  async login(@Body("email") email: string, @Body("password") password: string, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException("Donnée invalide");
    }
    if (!await bcrypt.compare(password, user.password)) {
      throw new BadRequestException("Donnée invalide");
    }

    // Création du JWTTokent
    const jwt = await this.jwtService.signAsync({ id: user.id })

    response.cookie('jwt', jwt, {
      httpOnly: true, // cookie devient inaxessible depuis JavaScript côté client
      sameSite: "none",
      secure: true,
      domain: "localhost"
    })

    return {
      message: "success",
      type: "success"
    };
  }


  /////////   AJOUT D'UN NOUVEAU USER ////////////

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() userDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(userDto.password, 12)

    try {
      const user = this.authService.register({
        email: userDto.email,
        password: hashedPassword
      });

      // Enlève le password de la réponse
      delete (await user).password

      return user;
    } catch (error) {
      throw new BadRequestException("Les données sont invalides");
    }
  }


  /////////   RÉCUPÉRATION DU USER ////////////

  @HttpCode(HttpStatus.OK)
  @Get('user')
  async getUser(@Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      if (!cookie) {
        throw new UnauthorizedException();
      }

      const decodedToken = await this.jwtService.verifyAsync(cookie);
      if (!decodedToken) {
        throw new UnauthorizedException();
      }

      const user = await this.authService.findOneById(decodedToken.id) // Remplacez par la méthode appropriée pour récupérer l'utilisateur
      if (!user) {
        throw new UnauthorizedException();
      }

      const { password, ...userData } = user;
      return userData;
    } catch (error) {
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
