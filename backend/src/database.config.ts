import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { InventoryEntity } from './inventory/inventory.entity';
import { InventorySnapshotEntity } from './inventory-snapshots/inventory-snapshot.entity';
import { ClientEntity } from './clients/client.entity';
import { DeliveryEntity } from './deliveries/delivery.entity';
import { InvoiceEntity } from './invoices/invoice.entity';
import { CompanySettingsEntity } from './company-settings/company-settings.entity';
import { UserEntity } from './users/user.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://admin:admin@localhost:5432/asperges',
    entities: [InventoryEntity, InventorySnapshotEntity, ClientEntity, DeliveryEntity, InvoiceEntity, CompanySettingsEntity, UserEntity],
    synchronize: true, // V1 only - pas de migrations
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};
