import { IsString, IsEmail, Length, IsOptional, IsNotEmpty } from 'class-validator';

export class EditUserDto {
  @Length(2, 50, {
    message: "Le nom doit être compris entre 2 et 50 caractères.",
  })
  @IsOptional()
  @IsString()
  us_nom?: string | null;

  @Length(2, 50, {
    message: "Le prénom doit être compris entre 2 et 50 caractères.",
  })
  @IsOptional()
  @IsString()
  us_prenom: string;

  @IsOptional()
  @IsEmail()
  us_email: string;

  @Length(8, 25, {
    message: "Le prénom doit être compris entre 2 et 50 caractères.",
  })
  @IsOptional()
  @IsString()
  us_login: string;
}