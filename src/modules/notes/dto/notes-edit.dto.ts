import {
  IsString,
  Length,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class EditNoteDto {
  @Length(0, 100, {
    message: 'Le libelle doit être compris entre 1 et 100 caractères.',
  })
  @IsOptional()
  @IsString()
  libelle?: string | null;

  @IsOptional()
  @IsString()
  message?: string | null;

  @IsOptional()
  @IsUUID()
  repertoireId?: string | null;
}
