import { IsString, Length, IsOptional, IsUUID } from 'class-validator';

export class EditTacheDto {
  @Length(1, 100, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsOptional()
  @IsString()
  libelle: string;

  @IsOptional()
  @IsString()
  couleur?: string | null;

  @IsOptional()
  @IsString()
  detail?: string | null;

  @IsOptional()
  @IsString()
  date: string;

  @IsOptional()
  @IsUUID()
  id_groupe: string;
}