import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventorySnapshotController } from './inventory-snapshot.controller';
import { InventorySnapshotEntity } from './inventory-snapshot.entity';
import { InventorySnapshotService } from './inventory-snapshot.service';

/**
 * Module InventorySnapshots - Gestion des stocks restants du soir
 */
@Module({
  imports: [TypeOrmModule.forFeature([InventorySnapshotEntity])],
  providers: [InventorySnapshotService],
  controllers: [InventorySnapshotController],
  exports: [InventorySnapshotService],
})
export class InventorySnapshotModule {}