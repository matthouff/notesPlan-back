import { IsString, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTacheDto {
  @Length(0, 25, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsOptional()
  @IsOptional()
  libelle?: string | null;

  @IsOptional()
  @IsString()
  couleur?: string | null;

  @IsNotEmpty()
  @IsUUID()
  tacheId: string;
}