import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database.config';
import { InventoryModule } from './inventory/inventory.module';
import { InventorySnapshotModule } from './inventory-snapshots/inventory-snapshot.module';
import { ClientModule } from './clients/client.module';
import { DeliveryModule } from './deliveries/delivery.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InvoiceModule } from './invoices/invoice.module';
import { CompanySettingsModule } from './company-settings/company-settings.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './products/product.module';
import { OrderModule } from './orders/order.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    InventoryModule,
    InventorySnapshotModule,
    ClientModule,
    DeliveryModule,
    DashboardModule,
    InvoiceModule,
    CompanySettingsModule,
    AuthModule,
    ProductModule,
    OrderModule,
  ],
})
export class AppModule {}
