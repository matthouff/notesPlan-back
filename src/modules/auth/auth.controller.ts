import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  Session,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/users-create.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AuthActions } from './auth.actions';
import { UsersService } from '../users/users.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authAction: AuthActions,
    private authService: AuthService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) { }

  /////////   CONNEXION D'UN USER ////////////

  /**
   * Tente de connecter un utilisateur en vérifiant les informations d'identification.
   *
   * @param email L'adresse e-mail de l'utilisateur.
   * @param password Le mot de passe de l'utilisateur.
   * @param response La réponse HTTP pour définir un cookie JWT en cas de connexion réussie.
   * @returns Un objet avec un message de succès en cas de connexion réussie.
   * @throws BadRequestException Si les informations d'identification sont invalides.
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const user = await this.authService.findOneByEmail(email);

      if (!user) {
        throw new BadRequestException({
          message: 'Les informations sont invalides',
          type: 'error',
        });
      }

      if (!(await bcrypt.compare(password, user.password))) {
        throw new BadRequestException({
          message: 'Les informations sont invalides',
          type: 'error',
        });
      }

      // Création du JWTTokent
      const jwt = await this.jwtService.signAsync({ id: user.id });
      response.cookie('jwt', jwt, {
        httpOnly: true, // cookie devient inaxessible depuis JavaScript côté client
        sameSite: 'none',
        secure: true,
        domain: 'localhost',
      });

      return {
        message: 'Connecté',
        type: 'success',
      };
    } catch (error) {
      response.status(400).json({
        message: 'Les informations sont invalides',
        type: 'error',
      });
    }
  }

  /////////   AJOUT D'UN NOUVEAU USER ////////////

  /**
   * Enregistre un nouvel utilisateur après avoir vérifié son email et son mot de passe.
   *
   * @param userDto Les données de l'utilisateur à enregistrer.
   * @param response La réponse HTTP pour renvoyer une réponse en cas de succès.
   * @returns Un objet avec les données de l'utilisateur enregistré.
   * @throws BadRequestException Si les données de l'utilisateur sont invalides.
   * @throws ConflictException Si un utilisateur avec le même email existe déjà.
   */
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() userDto: CreateUserDto, @Res() response: Response) {
    const hashedPassword = await bcrypt.hash(userDto.password, 12);
    const emailFormated = userDto.email.toLowerCase();
    const userExist = await this.userService.findByEmail(emailFormated);

    if (userExist) {
      throw new ConflictException({
        message: 'Un compte à déjà été créé avec cet email',
        type: 'error',
      });
    }

    try {
      const user = await this.authService.register({
        ...userDto,
        email: emailFormated,
        password: hashedPassword,
      });
      // Enlève le password de la réponse
      delete (await user).password;

      response.status(201).json({
        data: userDto,
        message: 'Votre compte à bien été créé',
        type: 'success',
      });
    } catch (error) {
      throw new BadRequestException('Les données sont invalides');
    }
  }

  /////////   RÉCUPÉRATION DU USER ////////////

  /**
   * Récupère les informations de l'utilisateur actuellement connecté à l'aide d'un token JWT valide.
   *
   * @param request La requête HTTP contenant le cookie JWT.
   * @returns Les informations de l'utilisateur (à l'exception du mot de passe) si l'utilisateur est authentifié.
   * @throws UnauthorizedException Si l'utilisateur n'est pas authentifié ou si le token est invalide.
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('user')
  async getUser(@Req() request: Request) {
    const token = request.cookies['jwt'];
    try {
      return await this.authAction.getUser(token);
    } catch (error) {
      throw new UnauthorizedException("Vous n'avez pas les autorisations");
    }
  }

  /////////   DÉCONNEXION DU USER ////////////

  /**
   * Déconnecte l'utilisateur en supprimant le cookie JWT.
   *
   * @param res La réponse HTTP pour supprimer le cookie.
   * @returns Un objet avec un message de succès en cas de déconnexion réussie.
   */
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Suppression du cookie jwt en cours
    res.clearCookie('jwt');

    return {
      message: 'Déconnecté',
      type: 'success',
    };
  }
}
