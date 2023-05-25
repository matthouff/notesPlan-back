import { IsString, IsEmail, Length, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class EditRepertoireDto {
  @IsString()
  @IsOptional()
  re_libelle: string;

  @IsUUID()
  @IsOptional()
  id_user: string;
}