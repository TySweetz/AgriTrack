import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySettingsController } from './company-settings.controller';
import { CompanySettingsEntity } from './company-settings.entity';
import { CompanySettingsService } from './company-settings.service';

/**
 * Module parametres entreprise
 */
@Module({
  imports: [TypeOrmModule.forFeature([CompanySettingsEntity])],
  providers: [CompanySettingsService],
  controllers: [CompanySettingsController],
  exports: [CompanySettingsService],
})
export class CompanySettingsModule {}
