import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryEntity } from './inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';

/**
 * Service pour la gestion de l'inventaire
 */
@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
  ) {}

  /**
   * Récupère tous les stocks
   */
  async findAll() {
    return this.inventoryRepository.find({
      order: { date: 'DESC' },
    });
  }

  /**
   * Récupère un stock par ID
   */
  async findOne(id: string) {
    return this.inventoryRepository.findOne({ where: { id } });
  }

  /**
   * Crée un nouveau stock
   */
  async create(dto: CreateInventoryDto) {
    const inventory = this.inventoryRepository.create({
      nombre_paniers: dto.nombre_paniers,
      poids_moyen_panier: dto.poids_moyen_panier || 5,
    });
    return this.inventoryRepository.save(inventory);
  }

  /**
   * Met à jour un stock
   */
  async update(id: string, dto: UpdateInventoryDto) {
    await this.inventoryRepository.update(id, dto);
    return this.findOne(id);
  }

  /**
   * Supprime un stock
   */
  async remove(id: string) {
    await this.inventoryRepository.delete(id);
    return { message: 'Stock supprimé avec succès' };
  }

  /**
   * Calcule le stock total en kg
   */
  async getTotalStock() {
    const result = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.nombre_paniers * inventory.poids_moyen_panier)', 'total')
      .getRawOne();
    return result?.total ? parseFloat(result.total) : 0;
  }
}
