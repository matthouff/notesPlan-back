import { IsString, IsEmail, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGroupeDto {
  @Length(2, 50, {
    message: "Le libelle doit être compris entre 2 et 50 caractères.",
  })
  @IsNotEmpty()
  @IsString()
  gr_libelle: string;

  @IsOptional()
  @IsString()
  gr_couleur?: string | null;

  @IsNotEmpty()
  @IsUUID()
  id_repertoire: string;
}