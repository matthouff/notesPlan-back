import { IsString, IsEmail, Length, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @Length(2, 50, {
    message: "Le nom doit être compris entre 2 et 50 caractères.",
  })
  @IsOptional()
  @IsString()
  us_nom?: string | null;

  @Length(2, 50, {
    message: "Le prénom doit être compris entre 2 et 50 caractères.",
  })
  @IsNotEmpty()
  @IsString()
  us_prenom: string;

  @IsNotEmpty()
  @IsEmail()
  us_email: string;

  @Length(8, 25, {
    message: "Le prénom doit être compris entre 2 et 50 caractères.",
  })
  @IsNotEmpty()
  @IsString()
  us_login: string;

  @Length(8, 25, {
    message: "Le prénom doit être compris entre 2 et 50 caractères.",
  })
  @IsNotEmpty()
  @IsString()
  us_password: string;
}