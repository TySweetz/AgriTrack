import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity, OrderItemEntity } from './order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductEntity } from '../products/product.entity';
import { AuthModule } from '../auth/auth.module';
import { InvoiceModule } from '../invoices/invoice.module';
import { DeliveryNoteModule } from '../delivery-notes/delivery-note.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, ProductEntity]),
    AuthModule,
    InvoiceModule,
    DeliveryNoteModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
