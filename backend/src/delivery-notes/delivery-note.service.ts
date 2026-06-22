import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { DeliveryNoteEntity, DeliveryNoteLine } from './delivery-note.entity';
import { OrderEntity } from '../orders/order.entity';
import { UserEntity } from '../users/user.entity';
import { CompanySettingsService } from '../company-settings/company-settings.service';

/**
 * Service pour la gestion des bons de livraison, generes a partir des commandes livrees
 */
@Injectable()
export class DeliveryNoteService {
  constructor(
    @InjectRepository(DeliveryNoteEntity)
    private readonly deliveryNoteRepository: Repository<DeliveryNoteEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly companySettingsService: CompanySettingsService,
  ) {}

  findMine(vendeurId: string) {
    return this.deliveryNoteRepository.find({
      where: { vendeurId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, vendeurId: string) {
    const note = await this.deliveryNoteRepository.findOne({ where: { id, vendeurId } });
    if (!note) throw new NotFoundException('Bon de livraison introuvable');
    return note;
  }

  private async generateBonNumber(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const prefix = `BL-${year}${month}${day}`;

    const count = await this.deliveryNoteRepository.count({
      where: { numero_bon: Like(`${prefix}-%`) },
    });

    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  /**
   * Genere le bon de livraison d'une commande (idempotent)
   */
  async generateForOrder(orderId: string, vendeurId: string) {
    const existing = await this.deliveryNoteRepository.findOne({ where: { orderId } });
    if (existing) return existing;

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      select: { acheteur: { id: true, nom: true, pseudo: true } },
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.vendeurId !== vendeurId) throw new ForbiddenException();

    const vendeur = await this.userRepository.findOne({ where: { id: vendeurId } });

    const items: DeliveryNoteLine[] = order.items.map((item) => ({
      nomProduit: item.nomProduit,
      unite: item.unite,
      quantite: Number(item.quantite),
    }));

    const note = this.deliveryNoteRepository.create({
      numero_bon: await this.generateBonNumber(new Date()),
      orderId: order.id,
      vendeurId,
      vendeurNom: vendeur?.entreprise || vendeur?.nom || 'Vendeur',
      acheteurNom: order.acheteur?.pseudo || order.acheteur?.nom || 'Acheteur',
      adresseLivraison: order.adresseLivraison,
      items,
    });

    return this.deliveryNoteRepository.save(note);
  }

  async getDocument(id: string, vendeurId: string) {
    const note = await this.findOne(id, vendeurId);
    const settings = await this.companySettingsService.getSettings(vendeurId);

    return {
      note,
      printableReference: note.numero_bon,
      printableDate: new Date(note.created_at).toLocaleDateString('fr-FR'),
      signature: {
        enabled: settings.signature_enabled_delivery,
        url: settings.signature_url,
      },
    };
  }
}
