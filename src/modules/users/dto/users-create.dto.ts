import { IsString, IsEmail, Length, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @Length(2, 50, {
    message: "Le nom doit être compris entre 2 et 50 caractères.",
  })
  @IsOptional()
  @IsString()
  nom?: string | null;

  @Length(2, 50, {
    message: "Le prénom doit être compris entre 2 et 50 caractères.",
  })
  @IsNotEmpty()
  @IsString()
  prenom: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Length(8, 25, {
    message: "Le prénom doit être compris entre 2 et 50 caractères.",
  })
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}