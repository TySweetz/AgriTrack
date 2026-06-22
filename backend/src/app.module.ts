import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database.config';
import { DashboardModule } from './dashboard/dashboard.module';
import { InvoiceModule } from './invoices/invoice.module';
import { DeliveryNoteModule } from './delivery-notes/delivery-note.module';
import { CompanySettingsModule } from './company-settings/company-settings.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './products/product.module';
import { OrderModule } from './orders/order.module';
import { ReviewModule } from './reviews/review.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    DashboardModule,
    InvoiceModule,
    DeliveryNoteModule,
    CompanySettingsModule,
    AuthModule,
    ProductModule,
    OrderModule,
    ReviewModule,
  ],
})
export class AppModule {}
