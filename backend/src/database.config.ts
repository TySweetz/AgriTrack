import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { InventoryEntity } from './inventory/inventory.entity';
import { InventorySnapshotEntity } from './inventory-snapshots/inventory-snapshot.entity';
import { ClientEntity } from './clients/client.entity';
import { DeliveryEntity } from './deliveries/delivery.entity';
import { InvoiceEntity } from './invoices/invoice.entity';
import { CompanySettingsEntity } from './company-settings/company-settings.entity';
import { UserEntity } from './users/user.entity';
<<<<<<< Updated upstream
<<<<<<< HEAD
import { ProductEntity } from './products/product.entity';
import { OrderEntity, OrderItemEntity } from './orders/order.entity';
=======
>>>>>>> 4eab4992ae8921ea84ed85e277dcd5509c9789be
=======
import { ProductEntity } from './products/product.entity';
import { OrderEntity, OrderItemEntity } from './orders/order.entity';
>>>>>>> Stashed changes

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://admin:admin@localhost:5432/asperges',
<<<<<<< Updated upstream
<<<<<<< HEAD
    entities: [InventoryEntity, InventorySnapshotEntity, ClientEntity, DeliveryEntity, InvoiceEntity, CompanySettingsEntity, UserEntity, ProductEntity, OrderEntity, OrderItemEntity],
=======
    entities: [InventoryEntity, InventorySnapshotEntity, ClientEntity, DeliveryEntity, InvoiceEntity, CompanySettingsEntity, UserEntity],
>>>>>>> 4eab4992ae8921ea84ed85e277dcd5509c9789be
=======
    entities: [InventoryEntity, InventorySnapshotEntity, ClientEntity, DeliveryEntity, InvoiceEntity, CompanySettingsEntity, UserEntity, ProductEntity, OrderEntity, OrderItemEntity],
>>>>>>> Stashed changes
    synchronize: true, // V1 only - pas de migrations
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};
