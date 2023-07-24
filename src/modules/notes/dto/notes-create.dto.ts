import { IsString, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @Length(0, 100, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsNotEmpty()
  @IsString()
  libelle: string;

  @IsOptional()
  @IsString()
  message?: string | null;

  @IsOptional()
  @IsUUID()
  repertoireId?: string | null;
}