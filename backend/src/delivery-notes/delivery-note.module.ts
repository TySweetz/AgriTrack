import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryNoteEntity } from './delivery-note.entity';
import { OrderEntity, OrderItemEntity } from '../orders/order.entity';
import { UserEntity } from '../users/user.entity';
import { CompanySettingsModule } from '../company-settings/company-settings.module';
import { DeliveryNoteService } from './delivery-note.service';
import { DeliveryNoteController } from './delivery-note.controller';

/**
 * Module DeliveryNotes - Gestion des bons de livraison generes a partir des commandes
 */
@Module({
  imports: [TypeOrmModule.forFeature([DeliveryNoteEntity, OrderEntity, OrderItemEntity, UserEntity]), CompanySettingsModule],
  providers: [DeliveryNoteService],
  controllers: [DeliveryNoteController],
  exports: [DeliveryNoteService],
})
export class DeliveryNoteModule {}
