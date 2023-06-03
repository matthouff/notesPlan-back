import { IsString, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class EditNoteDto {
  @Length(0, 100, {
    message: "Le libelle doit être compris entre 1 et 100 caractères.",
  })
  @IsOptional()
  @IsString()
  no_libelle?: string | null;

  @IsOptional()
  @IsString()
  no_message?: string | null;

  @IsOptional()
  @IsUUID()
  id_repertoire: string;
}