import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderItemEntity, OrderStatus } from './order.entity';
import { ProductEntity } from '../products/product.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private itemRepo: Repository<OrderItemEntity>,
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
  ) {}

  async create(dto: CreateOrderDto, acheteurId: string) {
    if (!dto.items.length) throw new BadRequestException('Le panier est vide');

    const firstProduct = await this.productRepo.findOne({ where: { id: dto.items[0].productId } });
    if (!firstProduct) throw new NotFoundException('Produit introuvable');
    const vendeurId = firstProduct.vendeurId;

    const items: OrderItemEntity[] = [];
    let total = 0;

    for (const itemDto of dto.items) {
      const product = await this.productRepo.findOne({ where: { id: itemDto.productId } });
      if (!product) throw new NotFoundException(`Produit ${itemDto.productId} introuvable`);
      if (!product.actif) throw new BadRequestException(`${product.nom} n'est plus disponible`);
      if (product.stock < itemDto.quantite)
        throw new BadRequestException(`Stock insuffisant pour ${product.nom}`);

      const sousTotal = Number(product.prix) * itemDto.quantite;
      total += sousTotal;

      const item = this.itemRepo.create({
        productId: product.id,
        nomProduit: product.nom,
        prixUnitaire: product.prix,
        unite: product.unite,
        quantite: itemDto.quantite,
        sousTotal,
      });
      items.push(item);

      product.stock = Number(product.stock) - itemDto.quantite;
<<<<<<< Updated upstream
=======
      if (product.stock <= 0) {
        product.stock = 0;
        product.actif = false;
      }
>>>>>>> Stashed changes
      await this.productRepo.save(product);
    }

    const order = this.orderRepo.create({
      acheteurId,
      vendeurId,
      total,
      adresseLivraison: dto.adresseLivraison,
      message: dto.message,
      items,
    });

    return this.orderRepo.save(order);
  }

  findByAcheteur(acheteurId: string) {
    return this.orderRepo.find({
      where: { acheteurId },
      order: { createdAt: 'DESC' },
    });
  }

  findByVendeur(vendeurId: string) {
    return this.orderRepo.find({
      where: { vendeurId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, vendeurId: string) {
    const order = await this.findOne(id);
    if (order.vendeurId !== vendeurId) throw new ForbiddenException();
    order.statut = dto.statut as OrderStatus;
    return this.orderRepo.save(order);
  }
<<<<<<< Updated upstream
=======

  async countPending(vendeurId: string) {
    const count = await this.orderRepo.count({
      where: { vendeurId, statut: OrderStatus.EN_ATTENTE },
    });
    return { count };
  }
>>>>>>> Stashed changes
}
