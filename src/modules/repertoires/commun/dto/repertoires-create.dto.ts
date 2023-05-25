import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRepertoireDto {
  @IsString()
  @IsNotEmpty()
  re_libelle: string;

  @IsUUID()
  @IsNotEmpty()
  id_user: string;
}