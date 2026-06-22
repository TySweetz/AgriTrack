import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity } from './invoice.entity';
import { OrderEntity, OrderItemEntity } from '../orders/order.entity';
import { UserEntity } from '../users/user.entity';
import { CompanySettingsModule } from '../company-settings/company-settings.module';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';

/**
 * Module Invoices - Gestion des factures generees a partir des commandes
 */
@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity, OrderEntity, OrderItemEntity, UserEntity]), CompanySettingsModule],
  providers: [InvoiceService],
  controllers: [InvoiceController],
  exports: [InvoiceService],
})
export class InvoiceModule {}
