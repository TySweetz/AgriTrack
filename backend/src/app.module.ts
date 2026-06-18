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
<<<<<<< HEAD
import { ProductModule } from './products/product.module';
import { OrderModule } from './orders/order.module';
=======
>>>>>>> 4eab4992ae8921ea84ed85e277dcd5509c9789be

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
<<<<<<< HEAD
    ProductModule,
    OrderModule,
=======
>>>>>>> 4eab4992ae8921ea84ed85e277dcd5509c9789be
  ],
})
export class AppModule {}
