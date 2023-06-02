import { IsString, Length, IsOptional, IsUUID } from 'class-validator';

export class EditLabelDto {
  @Length(0, 25, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsOptional()
  @IsOptional()
  la_libelle?: string | null;

  @IsOptional()
  @IsString()
  la_couleur?: string | null;

  @IsOptional()
  @IsUUID()
  id_tache: string;
}