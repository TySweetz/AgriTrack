import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './review.entity';
import { OrderEntity, OrderItemEntity } from '../orders/order.entity';
import { UserEntity } from '../users/user.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity, OrderEntity, OrderItemEntity, UserEntity])],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}
