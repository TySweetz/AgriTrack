import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryEntity } from './delivery.entity';
import { ClientEntity } from '../clients/client.entity';
import { CompanySettingsModule } from '../company-settings/company-settings.module';
import { InventoryModule } from '../inventory/inventory.module';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';

/**
 * Module Deliveries - Gestion des livraisons d'asperges
 */
@Module({
  imports: [TypeOrmModule.forFeature([DeliveryEntity, ClientEntity]), CompanySettingsModule, InventoryModule],
  providers: [DeliveryService],
  controllers: [DeliveryController],
  exports: [DeliveryService],
})
export class DeliveryModule {}
