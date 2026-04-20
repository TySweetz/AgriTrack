import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from '../inventory/inventory.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { DeliveryModule } from '../deliveries/delivery.module';

/**
 * Module Dashboard - Agrégats et statistiques
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryEntity]),
    InventoryModule,
    DeliveryModule,
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
