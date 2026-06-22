import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OrderEntity, OrderStatus } from '../orders/order.entity';
import { ProductEntity } from '../products/product.entity';
import { ReviewEntity } from '../reviews/review.entity';

const CONFIRMED_STATUSES = [OrderStatus.ACCEPTEE, OrderStatus.LIVREE];

/**
 * Service pour la gestion du dashboard - agregats calcules a partir des
 * commandes et produits reels du vendeur connecte
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
  ) {}

  async getDashboardData(vendeurId: string) {
    const [orders, products] = await Promise.all([
      // Note: select sur une relation `eager` n'est pas applique par TypeORM — seuls des
      // champs precis sont extraits de order.acheteur plus bas, jamais l'objet complet.
      this.orderRepository.find({ where: { vendeurId }, order: { createdAt: 'DESC' } }),
      this.productRepository.find({ where: { vendeurId } }),
    ]);

    const productIds = products.map((p) => p.id);
    const reviews = productIds.length
      ? await this.reviewRepository.find({ where: { productId: In(productIds) } })
      : [];
    const reviewsCount = reviews.length;
    const companyRating = {
      average: reviewsCount > 0 ? reviews.reduce((sum, r) => sum + r.note, 0) / reviewsCount : 0,
      count: reviewsCount,
    };

    const confirmed = orders.filter((o) => CONFIRMED_STATUSES.includes(o.statut));
    const totalRevenue = confirmed.reduce((sum, o) => sum + Number(o.total), 0);
    const pendingCount = orders.filter((o) => o.statut === OrderStatus.EN_ATTENTE).length;

    const productAgg = new Map<string, { nom: string; unite: string; quantite: number; revenue: number }>();
    for (const order of confirmed) {
      for (const item of order.items) {
        const current = productAgg.get(item.productId) || {
          nom: item.nomProduit,
          unite: item.unite,
          quantite: 0,
          revenue: 0,
        };
        current.quantite += Number(item.quantite);
        current.revenue += Number(item.sousTotal);
        productAgg.set(item.productId, current);
      }
    }
    const topProducts = [...productAgg.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const lowStockProducts = products
      .filter((p) => p.actif && Number(p.stock) <= 5)
      .sort((a, b) => Number(a.stock) - Number(b.stock))
      .slice(0, 5)
      .map((p) => ({ id: p.id, nom: p.nom, stock: Number(p.stock), unite: p.unite }));

    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      acheteurNom: o.acheteur?.pseudo || o.acheteur?.nom || 'Acheteur',
      total: Number(o.total),
      statut: o.statut,
      createdAt: o.createdAt,
      itemsCount: o.items.length,
    }));

    const days = 14;
    const salesByDay: { date: string; total: number }[] = [];
    const byDate = new Map<string, number>();
    for (const order of confirmed) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      byDate.set(key, (byDate.get(key) || 0) + Number(order.total));
    }
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      salesByDay.push({ date: key, total: byDate.get(key) || 0 });
    }

    return {
      totalRevenue,
      ordersConfirmedCount: confirmed.length,
      pendingOrdersCount: pendingCount,
      activeProductsCount: products.filter((p) => p.actif).length,
      totalProductsCount: products.length,
      companyRating,
      topProducts,
      lowStockProducts,
      recentOrders,
      salesByDay,
    };
  }
}
