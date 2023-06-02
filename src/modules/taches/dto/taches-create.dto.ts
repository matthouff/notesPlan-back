import { IsString, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTacheDto {
  @Length(1, 100, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsNotEmpty()
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
  ta_date?: string | null;

  @IsNotEmpty()
  @IsUUID()
  id_groupe: string;
}