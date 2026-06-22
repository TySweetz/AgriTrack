import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserEntity, UserRole } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé');

    const hashed = await bcrypt.hash(dto.password, 10);
    const isAcheteur = dto.role !== UserRole.AGRICULTEUR;
    const user = this.userRepo.create({
      ...dto,
      password: hashed,
      pseudo: isAcheteur ? dto.nom : undefined,
    });
    await this.userRepo.save(user);

    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    return this.buildResponse(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    // On ne révèle pas si l'email existe ou non
    if (!user) return { message: 'Si cet email existe, un lien a été envoyé.' };

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    user.resetToken = token;
    user.resetTokenExpires = expires;
    await this.userRepo.save(user);

    await this.mailService.sendPasswordReset(user.email, user.nom, token);

    return { message: 'Si cet email existe, un lien a été envoyé.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepo.findOne({ where: { resetToken: dto.token } });

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await this.userRepo.save(user);

    return { message: 'Mot de passe mis à jour avec succès' };
  }

  async switchRole(userId: string, dto: SwitchRoleDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (dto.role === UserRole.AGRICULTEUR && !user.telephone) {
      throw new BadRequestException(
        "Le nom de l'entreprise et le téléphone sont requis pour passer en mode agriculteur",
      );
    }

    user.role = dto.role as UserRole;
    await this.userRepo.save(user);

    return this.buildResponse(user);
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (dto.nom !== undefined) user.nom = dto.nom;
    if (dto.entreprise !== undefined) user.entreprise = dto.entreprise;
    if (dto.telephone !== undefined) user.telephone = dto.telephone;
    if (dto.adresse !== undefined) user.adresse = dto.adresse;
    if (dto.pseudo !== undefined) user.pseudo = dto.pseudo;
    await this.userRepo.save(user);

    return this.buildResponse(user);
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    return {
      id: user.id,
      email: user.email,
      nom: user.nom,
      entreprise: user.entreprise,
      role: user.role,
      telephone: user.telephone,
      adresse: user.adresse,
      pseudo: user.pseudo,
    };
  }

  async getPublicVendeur(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Vendeur introuvable');
    return {
      id: user.id,
      nom: user.entreprise || user.nom,
      telephone: user.telephone,
      adresse: user.adresse,
    };
  }

  private buildResponse(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        entreprise: user.entreprise,
        role: user.role,
        telephone: user.telephone,
        adresse: user.adresse,
        pseudo: user.pseudo,
      },
    };
  }
}
