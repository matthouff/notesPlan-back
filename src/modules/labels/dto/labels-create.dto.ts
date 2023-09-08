import {
  IsString,
  Length,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  isNotEmpty,
} from 'class-validator';

export class CreateLabelDto {
  @Length(1, 25, {
    message: 'Le libelle doit être compris entre 1 et 25 caractères.',
  })
  @IsNotEmpty()
  @IsString()
  libelle: string;

  @IsOptional()
  @IsString()
  couleur?: string | null;

  @IsNotEmpty()
  @IsString()
  repertoireId: string;
}
