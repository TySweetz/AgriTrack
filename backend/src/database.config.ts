import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { InvoiceEntity } from './invoices/invoice.entity';
import { DeliveryNoteEntity } from './delivery-notes/delivery-note.entity';
import { CompanySettingsEntity } from './company-settings/company-settings.entity';
import { UserEntity } from './users/user.entity';
import { ProductEntity } from './products/product.entity';
import { OrderEntity, OrderItemEntity } from './orders/order.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://admin:admin@localhost:5432/asperges',
    entities: [InvoiceEntity, DeliveryNoteEntity, CompanySettingsEntity, UserEntity, ProductEntity, OrderEntity, OrderItemEntity],
    synchronize: true, // V1 only - pas de migrations
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};
