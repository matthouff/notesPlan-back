import { IsString, Length, IsOptional, IsUUID } from 'class-validator';

export class EditLabelDto {
  @Length(0, 25, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsOptional()
  @IsOptional()
  libelle?: string | null;

  @IsOptional()
  @IsString()
  couleur?: string | null;

  @IsOptional()
  @IsUUID()
  id_tache: string;
}