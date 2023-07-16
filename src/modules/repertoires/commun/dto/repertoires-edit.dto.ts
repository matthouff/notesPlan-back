import { IsString, IsEmail, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class EditRepertoireDto {
  @IsString()
  @IsOptional()
  libelle: string;

  @IsUUID()
  @IsOptional()
  id_user: string;
}