import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './review.entity';
import { CreateReviewDto } from './review.dto';
import { OrderEntity, OrderItemEntity, OrderStatus } from '../orders/order.entity';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepo: Repository<ReviewEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepo: Repository<OrderItemEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async findByProduct(productId: string) {
    const reviews = await this.reviewRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
    const count = reviews.length;
    const average = count > 0 ? reviews.reduce((sum, r) => sum + r.note, 0) / count : 0;
    return { reviews, average, count };
  }

  async findMine(productId: string, acheteurId: string) {
    return this.reviewRepo.findOne({ where: { productId, acheteurId } });
  }

  private async hasVerifiedPurchase(productId: string, acheteurId: string) {
    const count = await this.orderItemRepo
      .createQueryBuilder('item')
      .innerJoin(OrderEntity, 'order', 'order.id = item.orderId')
      .where('item.productId = :productId', { productId })
      .andWhere('order.acheteurId = :acheteurId', { acheteurId })
      .andWhere('order.statut = :statut', { statut: OrderStatus.LIVREE })
      .getCount();
    return count > 0;
  }

  async upsert(dto: CreateReviewDto, acheteurId: string) {
    const verified = await this.hasVerifiedPurchase(dto.productId, acheteurId);
    if (!verified) {
      throw new ForbiddenException(
        'Seuls les acheteurs ayant reçu une commande de ce produit peuvent laisser un avis',
      );
    }

    const acheteur = await this.userRepo.findOne({ where: { id: acheteurId } });
    const existing = await this.findMine(dto.productId, acheteurId);

    if (existing) {
      existing.note = dto.note;
      existing.commentaire = dto.commentaire;
      return this.reviewRepo.save(existing);
    }

    const review = this.reviewRepo.create({
      productId: dto.productId,
      acheteurId,
      acheteurNom: acheteur?.pseudo || acheteur?.nom || 'Acheteur',
      note: dto.note,
      commentaire: dto.commentaire,
    });
    return this.reviewRepo.save(review);
  }

  async remove(id: string, acheteurId: string) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Avis introuvable');
    if (review.acheteurId !== acheteurId) throw new ForbiddenException();
    await this.reviewRepo.remove(review);
    return { success: true };
  }
}
