import { IsString, Length, IsOptional, IsUUID } from 'class-validator';

export class EditTacheDto {
  @Length(1, 100, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsOptional()
  @IsString()
  ta_libelle: string;

  @IsOptional()
  @IsString()
  ta_couleur?: string | null;

  @IsOptional()
  @IsString()
  ta_detail?: string | null;

  @IsOptional()
  @IsString()
  ta_date: string;

  @IsOptional()
  @IsUUID()
  id_groupe: string;
}