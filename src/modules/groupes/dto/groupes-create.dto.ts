import { IsString, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGroupeDto {
  @Length(2, 50, {
    message: "Le libelle doit être compris entre 2 et 50 caractères.",
  })
  @IsNotEmpty()
  @IsString()
  libelle: string;

  @IsOptional()
  @IsString()
  couleur?: string | null;

  @IsNotEmpty()
  @IsUUID()
  repertoireId: string;
}