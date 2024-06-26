import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRepertoireDto {
  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}