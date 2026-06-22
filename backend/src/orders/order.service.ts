import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderItemEntity, OrderStatus } from './order.entity';
import { ProductEntity } from '../products/product.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';
import { InvoiceService } from '../invoices/invoice.service';
import { DeliveryNoteService } from '../delivery-notes/delivery-note.service';

/**
 * TypeORM n'applique pas le filtrage `select` sur une relation chargee en `eager: true`
 * (verifie : la requete generee selectionne quand meme toutes les colonnes, y compris
 * le mot de passe). On assainit donc manuellement l'acheteur avant de renvoyer la commande.
 */
function sanitizeOrder<T extends OrderEntity>(order: T) {
  if (!order.acheteur) return order;
  return {
    ...order,
    acheteur: { id: order.acheteur.id, nom: order.acheteur.nom, pseudo: order.acheteur.pseudo },
  };
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private itemRepo: Repository<OrderItemEntity>,
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
    private invoiceService: InvoiceService,
    private deliveryNoteService: DeliveryNoteService,
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
      if (product.stock <= 0) {
        product.stock = 0;
        product.actif = false;
      }
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

  async findByAcheteur(acheteurId: string) {
    const orders = await this.orderRepo.find({ where: { acheteurId }, order: { createdAt: 'DESC' } });
    return orders.map(sanitizeOrder);
  }

  async findByVendeur(vendeurId: string) {
    const orders = await this.orderRepo.find({ where: { vendeurId }, order: { createdAt: 'DESC' } });
    return orders.map(sanitizeOrder);
  }

  private async loadOne(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async findOne(id: string) {
    return sanitizeOrder(await this.loadOne(id));
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, vendeurId: string) {
    const order = await this.loadOne(id);
    if (order.vendeurId !== vendeurId) throw new ForbiddenException();
    order.statut = dto.statut as OrderStatus;
    const saved = await this.orderRepo.save(order);

    try {
      if (saved.statut === OrderStatus.ACCEPTEE) {
        await this.invoiceService.generateForOrder(saved.id, vendeurId);
      } else if (saved.statut === OrderStatus.LIVREE) {
        await this.invoiceService.generateForOrder(saved.id, vendeurId);
        await this.deliveryNoteService.generateForOrder(saved.id, vendeurId);
      }
    } catch (error) {
      console.error('Erreur lors de la generation des documents de commande:', error);
    }

    return sanitizeOrder(saved);
  }

  async countPending(vendeurId: string) {
    const count = await this.orderRepo.count({
      where: { vendeurId, statut: OrderStatus.EN_ATTENTE },
    });
    return { count };
  }
}
