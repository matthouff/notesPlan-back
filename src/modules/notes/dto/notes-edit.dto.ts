import {
  IsString,
  Length,
  IsOptional,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { RepertoireNote } from 'src/modules/repertoires/repertoires-notes/entity/repertoires-notes';

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
  repertoireId: string;
}
