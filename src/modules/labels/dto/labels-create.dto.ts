import { IsString, Length, IsOptional, IsNotEmpty, IsUUID, isNotEmpty } from 'class-validator';

export class CreateLabelDto {
  @Length(0, 25, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsNotEmpty()
  @IsString()
  libelle: string;

  @IsOptional()
  @IsString()
  couleur?: string | null;

  @IsNotEmpty()
  @IsUUID()
  tacheId: string;

  @IsNotEmpty()
  @IsString()
  repertoireId: string;
}