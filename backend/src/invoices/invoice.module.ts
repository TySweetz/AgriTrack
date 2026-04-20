import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity } from './invoice.entity';
import { DeliveryEntity } from '../deliveries/delivery.entity';
import { ClientEntity } from '../clients/client.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';

/**
 * Module Invoices - Gestion des factures mensuelles
 */
@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity, DeliveryEntity, ClientEntity])],
  providers: [InvoiceService],
  controllers: [InvoiceController],
  exports: [InvoiceService],
})
export class InvoiceModule {}