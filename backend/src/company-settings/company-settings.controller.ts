import { Body, Controller, Delete, Get, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { UpdateCompanySettingsDto } from './company-settings.dto';
import { CompanySettingsService } from './company-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controleur des parametres entreprise (scope: vendeur connecte)
 */
@Controller('company-settings')
@UseGuards(JwtAuthGuard)
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) {}

  @Get()
  async getSettings(@Request() req: any) {
    return this.companySettingsService.getSettings(req.user.id);
  }

  @Patch()
  async updateSettings(@Request() req: any, @Body() dto: UpdateCompanySettingsDto) {
    return this.companySettingsService.updateSettings(req.user.id, dto);
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
  async uploadSignature(@Request() req: any, @UploadedFile() file: any) {
    return this.companySettingsService.uploadSignature(req.user.id, file);
  }

  @Delete('signature')
  async removeSignature(@Request() req: any) {
    return this.companySettingsService.removeSignature(req.user.id);
  }
}
