import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
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

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @IsOptional()
  adresse?: string;
}
