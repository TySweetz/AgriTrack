import { IsEmail, IsString, MinLength, IsEnum, IsOptional, ValidateIf, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  nom!: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ValidateIf((dto) => dto.role === UserRole.AGRICULTEUR)
  @IsNotEmpty({ message: 'Le téléphone est obligatoire pour un compte agriculteur' })
  @IsString()
  telephone?: string;

  @IsString()
  @IsOptional()
  adresse?: string;
}
