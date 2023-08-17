import { BadRequestException, Body, ConflictException, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/users-create.dto';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AuthActions } from './auth.actions';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authAction: AuthActions,
    private authService: AuthService,
    private jwtService: JwtService,
    private userService: UsersService
  ) { }


  /////////   CONNEXION D'UN USER ////////////

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body("email") email: string, @Body("password") password: string, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException({ message: "Les informations sont invalides", type: "error" });
    }
    if (!await bcrypt.compare(password, user.password)) {
      throw new BadRequestException({ message: "Les informations sont invalides", type: "error" });
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
      message: "Connecté",
      type: "success"
    };
  }


  /////////   AJOUT D'UN NOUVEAU USER ////////////

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() userDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(userDto.password, 12)
    const userExist = await this.userService.findByEmail(userDto.email)

    if (userExist) {
      throw new ConflictException({ message: "Un compte à déjà été créé avec cet email", type: "error" });
    }

    try {
      const user = await this.authService.register({
        ...userDto,
        password: hashedPassword
      });
      // Enlève le password de la réponse
      delete (await user).password

      return {
        message: "Votre compte à bien été créé",
        type: "success"
      };
    } catch (error) {
      throw new BadRequestException("Les données sont invalides");
    }
  }


  /////////   RÉCUPÉRATION DU USER ////////////

  @HttpCode(HttpStatus.OK)
  @Get('user')
  async getUser(@Req() request: Request) {
    try {
      return await this.authAction.getUser(request)
    } catch (error) {
      throw new UnauthorizedException("Vous n'avez pas les autorisations");
    }
  }


  /////////   DÉCONNEXION DU USER ////////////

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    // Suppression du cookie jwt en cours
    res.clearCookie("jwt")

    return {
      message: "Déconnecté",
      type: "success"
    };
  }
}
