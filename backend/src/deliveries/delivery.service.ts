import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
   * Crée une nouvelle livraison
   */
  async create(dto: CreateDeliveryDto) {
    const delivery = this.deliveryRepository.create(dto);
    return this.deliveryRepository.save(delivery);
  }

  /**
   * Met à jour une livraison
   */
  async update(id: string, dto: UpdateDeliveryDto) {
    await this.deliveryRepository.update(id, dto);
    return this.findOne(id);
  }

  /**
   * Supprime une livraison
   */
  async remove(id: string) {
    await this.deliveryRepository.delete(id);
    return { message: 'Livraison supprimée avec succès' };
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
