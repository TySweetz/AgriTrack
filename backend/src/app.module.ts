import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database.config';
import { InventoryModule } from './inventory/inventory.module';
import { ClientModule } from './clients/client.module';
import { DeliveryModule } from './deliveries/delivery.module';
import { DashboardModule } from './dashboard/dashboard.module';

/**
 * Module principal de l'application NestJS
 */
@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    InventoryModule,
    ClientModule,
    DeliveryModule,
    DashboardModule,
  ],
})
export class AppModule {}
