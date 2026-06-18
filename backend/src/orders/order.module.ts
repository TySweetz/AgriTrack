import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity, OrderItemEntity } from './order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductEntity } from '../products/product.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, ProductEntity]),
    AuthModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
