import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @IsOptional()
  adresse?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  pseudo?: string;
}
