import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CompanySettingsService } from '../company-settings/company-settings.service';
import { InventoryService } from '../inventory/inventory.service';
import { DeliveryEntity } from './delivery.entity';
import { CreateDeliveryDto, UpdateDeliveryDto } from './delivery.dto';

/**
 * Service pour la gestion des livraisons
 */
@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly deliveryRepository: Repository<DeliveryEntity>,
    private readonly companySettingsService: CompanySettingsService,
    private readonly inventoryService: InventoryService,
  ) {}

  /**
   * Récupère toutes les livraisons avec les données du client
   */
  async findAll() {
    return this.deliveryRepository.find({
      relations: ['client'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Récupère une livraison par ID
   */
  async findOne(id: string) {
    return this.deliveryRepository.findOne({
      where: { id },
      relations: ['client'],
    });
  }

  /**
   * Génère le numéro de bon de livraison du jour
   */
  async generateBonNumber(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const prefix = `BL-${year}${month}${day}`;

    const count = await this.deliveryRepository.count({
      where: { numero_bon: Like(`${prefix}-%`) },
    });

    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  /**
   * Crée une nouvelle livraison et décrémente le stock automatiquement
   */
  async create(dto: CreateDeliveryDto) {
    const deliveryDate = dto.date ? new Date(dto.date) : new Date();
    const numeroBon = await this.generateBonNumber(deliveryDate);

    const delivery = this.deliveryRepository.create({
      ...dto,
      date: deliveryDate,
      numero_bon: numeroBon,
      document_status: 'DRAFT',
    });

    const savedDelivery = await this.deliveryRepository.save(delivery);

    // Décrémenter le stock d'inventaire de la quantité livrée
    try {
      await this.inventoryService.decrementStockForDelivery(
        Number(dto.quantite_kg),
        deliveryDate,
      );
    } catch (error) {
      console.error('Erreur lors du décrémentation du stock:', error);
      // Ne pas échouer la livraison si le stock échoue
    }

    return savedDelivery;
  }

  /**
   * Met à jour une livraison
   */
  async update(id: string, dto: UpdateDeliveryDto) {
    await this.deliveryRepository.update(id, dto);
    return this.findOne(id);
  }

  /**
   * Supprime une livraison et restaure le stock
   */
  async remove(id: string) {
    // Récupérer la livraison avant suppression pour restaurer le stock
    const delivery = await this.findOne(id);

    if (delivery) {
      try {
        // Restaurer le stock d'inventaire
        await this.inventoryService.incrementStockForDeletedDelivery(
          Number(delivery.quantite_kg),
          delivery.date,
        );
      } catch (error) {
        console.error('Erreur lors de la restauration du stock:', error);
        // Ne pas échouer la suppression si la restauration échoue
      }
    }

    await this.deliveryRepository.delete(id);
    return { message: 'Livraison supprimée avec succès' };
  }

  /**
   * Retourne les données prêtes à afficher ou imprimer pour un bon de livraison
   */
  async getDocument(id: string) {
    const delivery = await this.findOne(id);

    if (!delivery) {
      return null;
    }

    const settings = await this.companySettingsService.getSettings();

    return {
      delivery,
      documentTitle: 'Bon de livraison',
      printableReference: delivery.numero_bon,
      printableDate: new Date(delivery.date).toLocaleDateString('fr-FR'),
      signature: {
        enabled: settings.signature_enabled_delivery,
        url: settings.signature_url,
      },
    };
  }

  /**
   * Récupère les 5 dernières livraisons
   */
  async getRecent(limit: number = 5) {
    return this.deliveryRepository.find({
      relations: ['client'],
      order: { date: 'DESC' },
      take: limit,
    });
  }

  /**
   * Calcule le total des kg livrés
   */
  async getTotalDelivered() {
    const result = await this.deliveryRepository
      .createQueryBuilder('delivery')
      .select('SUM(delivery.quantite_kg)', 'total')
      .getRawOne();
    return result?.total ? parseFloat(result.total) : 0;
  }
}
