import { IsString, IsEmail, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class EditGroupeDto {
  @Length(2, 50, {
    message: "Le libelle doit être compris entre 2 et 50 caractères.",
  })
  @IsOptional()
  @IsString()
  gr_libelle: string;

  @IsOptional()
  @IsString()
  gr_couleur?: string | null;

  @IsOptional()
  @IsUUID()
  id_repertoire: string;
}