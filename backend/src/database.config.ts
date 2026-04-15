import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { InventoryEntity } from './inventory/inventory.entity';
import { ClientEntity } from './clients/client.entity';
import { DeliveryEntity } from './deliveries/delivery.entity';

/**
 * Configuration TypeORM pour PostgreSQL
 * Utilise synchronize: true pour créer automatiquement les tables en V1
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://admin:admin@localhost:5432/asperges',
    entities: [InventoryEntity, ClientEntity, DeliveryEntity],
    synchronize: true, // V1 only - pas de migrations
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};
