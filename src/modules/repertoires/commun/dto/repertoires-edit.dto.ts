import { IsString, IsOptional, IsUUID } from 'class-validator';

export class EditRepertoireDto {
  @IsString()
  @IsOptional()
  libelle: string;
}
