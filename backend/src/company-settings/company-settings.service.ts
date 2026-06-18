import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { UpdateCompanySettingsDto } from './company-settings.dto';
import { CompanySettingsEntity } from './company-settings.entity';

/**
 * Service pour les parametres entreprise
 */
@Injectable()
export class CompanySettingsService {
  constructor(
    @InjectRepository(CompanySettingsEntity)
    private readonly settingsRepository: Repository<CompanySettingsEntity>,
  ) {}

  private getUploadsRoot() {
    return join(process.cwd(), 'uploads', 'signatures');
  }

  private ensureUploadsDirectory() {
    const uploadsDir = this.getUploadsRoot();

    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    return uploadsDir;
  }

  private getBaseUrl() {
    return process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  }

  private toResponse(settings: CompanySettingsEntity) {
    const signatureUrl = settings.signature_file_path
      ? `${this.getBaseUrl()}${settings.signature_file_path}`
      : null;

    return {
      id: settings.id,
      company_name: settings.company_name || null,
      signature_enabled_delivery: settings.signature_enabled_delivery,
      signature_enabled_invoice: settings.signature_enabled_invoice,
      signature_url: signatureUrl,
      signature_file_name: settings.signature_file_name || null,
      updated_at: settings.updated_at,
      created_at: settings.created_at,
    };
  }

  async getOrCreate() {
    const [existing] = await this.settingsRepository.find({
      order: { created_at: 'ASC' },
      take: 1,
    });

    if (existing) {
      return existing;
    }

    const created = this.settingsRepository.create({
      signature_enabled_delivery: true,
      signature_enabled_invoice: true,
    });

    return this.settingsRepository.save(created);
  }

  async getSettings() {
    const settings = await this.getOrCreate();
    return this.toResponse(settings);
  }

  async updateSettings(dto: UpdateCompanySettingsDto) {
    const settings = await this.getOrCreate();

    if (dto.company_name !== undefined) {
      settings.company_name = dto.company_name;
    }

    if (dto.signature_enabled_delivery !== undefined) {
      settings.signature_enabled_delivery = dto.signature_enabled_delivery;
    }

    if (dto.signature_enabled_invoice !== undefined) {
      settings.signature_enabled_invoice = dto.signature_enabled_invoice;
    }

    const saved = await this.settingsRepository.save(settings);
    return this.toResponse(saved);
  }

  async uploadSignature(file: any) {
    if (!file) {
      throw new BadRequestException('Fichier requis');
    }

    const allowedTypes = ['image/png', 'image/jpeg'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Format invalide. PNG ou JPEG uniquement');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('Fichier trop volumineux (2MB max)');
    }

    const settings = await this.getOrCreate();
    this.ensureUploadsDirectory();

    if (settings.signature_file_path) {
      const oldFileAbsolute = join(process.cwd(), settings.signature_file_path.replace(/^\//, ''));

      if (existsSync(oldFileAbsolute)) {
        unlinkSync(oldFileAbsolute);
      }
    }

    settings.signature_file_path = `/uploads/signatures/${file.filename}`;
    settings.signature_file_name = file.originalname;
    settings.signature_mime_type = file.mimetype;
    settings.signature_file_size = file.size;

    const saved = await this.settingsRepository.save(settings);
    return this.toResponse(saved);
  }

  async removeSignature() {
    const settings = await this.getOrCreate();

    if (settings.signature_file_path) {
      const oldFileAbsolute = join(process.cwd(), settings.signature_file_path.replace(/^\//, ''));

      if (existsSync(oldFileAbsolute)) {
        unlinkSync(oldFileAbsolute);
      }
    }

    settings.signature_file_path = null;
    settings.signature_file_name = null;
    settings.signature_mime_type = null;
    settings.signature_file_size = null;

    const saved = await this.settingsRepository.save(settings);
    return this.toResponse(saved);
  }
}
