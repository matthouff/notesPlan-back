import { IsString, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class EditGroupeDto {
  @Length(2, 50, {
    message: "Le libelle doit être compris entre 2 et 50 caractères.",
  })
  @IsOptional()
  @IsString()
  libelle?: string | null;

  @IsOptional()
  @IsString()
  couleur?: string | null;
}