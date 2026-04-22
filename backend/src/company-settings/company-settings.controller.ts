import { Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { UpdateCompanySettingsDto } from './company-settings.dto';
import { CompanySettingsService } from './company-settings.service';

/**
 * Controleur des parametres entreprise
 */
@Controller('company-settings')
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) {}

  @Get()
  async getSettings() {
    return this.companySettingsService.getSettings();
  }

  @Patch()
  async updateSettings(@Body() dto: UpdateCompanySettingsDto) {
    return this.companySettingsService.updateSettings(dto);
  }

  @Post('signature')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req: any, _file: any, cb: any) => {
          const target = join(process.cwd(), 'uploads', 'signatures');

          if (!existsSync(target)) {
            mkdirSync(target, { recursive: true });
          }

          cb(null, target);
        },
        filename: (_req: any, file: any, cb: any) => {
          cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async uploadSignature(@UploadedFile() file: any) {
    return this.companySettingsService.uploadSignature(file);
  }

  @Delete('signature')
  async removeSignature() {
    return this.companySettingsService.removeSignature();
  }
}
