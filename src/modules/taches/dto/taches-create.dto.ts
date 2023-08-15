import { IsString, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTacheDto {
  @Length(1, 100, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsNotEmpty()
  @IsString()
  libelle: string;

  @IsOptional()
  @IsString()
  detail?: string | null;

  @IsNotEmpty()
  @IsUUID()
  groupeId: string;
}