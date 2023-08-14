import { IsString, IsEmail, Length, IsOptional, IsNotEmpty } from 'class-validator';

export class EditUserDto {
  @Length(2, 50, {
    message: "Le nom doit être compris entre 2 et 50 caractères.",
  })
  @IsOptional()
  @IsString()
  nom?: string | null;

  @Length(2, 50, {
    message: "Le prénom doit être compris entre 2 et 50 caractères.",
  })
  @IsOptional()
  @IsString()
  prenom?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  password?: string | null;

}