import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity, OrderItemEntity } from '../orders/order.entity';
import { ProductEntity } from '../products/product.entity';
import { ReviewEntity } from '../reviews/review.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

/**
 * Module Dashboard - Agrégats et statistiques de vente du vendeur connecte
 */
@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, ProductEntity, ReviewEntity])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
