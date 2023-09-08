import { IsString, Length, IsOptional, IsUUID } from 'class-validator';

export class EditLabelDto {
  @Length(1, 25, {
    message: 'Le libelle doit être compris entre 1 et 25 caractères.',
  })
  @IsOptional()
  @IsOptional()
  libelle?: string | null;

  @IsOptional()
  @IsString()
  couleur?: string | null;

  @IsOptional()
  @IsUUID()
  tacheId: string[];

  @IsOptional()
  @IsString()
  repertoireId: string;
}
