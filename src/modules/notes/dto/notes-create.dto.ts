import { IsString, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @Length(0, 100, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsOptional()
  @IsString()
  libelle?: string | null;

  @IsOptional()
  @IsString()
  message?: string | null;

  @IsNotEmpty()
  @IsUUID()
  id_repertoire: string;
}