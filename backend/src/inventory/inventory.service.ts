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
    const inventoryDate = dto.date ? new Date(dto.date) : new Date();
    const poidsMoyenBotte = dto.poids_moyen_botte || 5;

    const inventory = this.inventoryRepository.create({
      nombre_bottes: dto.nombre_bottes,
      poids_moyen_botte: poidsMoyenBotte,
      nombre_paniers: dto.nombre_bottes,
      poids_moyen_panier: poidsMoyenBotte,
      stock_total_kg: dto.nombre_bottes * poidsMoyenBotte,
      date: inventoryDate,
    });
    return this.inventoryRepository.save(inventory);
  }

  /**
   * Met à jour un stock
   */
  async update(id: string, dto: UpdateInventoryDto) {
    const updatePayload: Partial<InventoryEntity> = {};

    if (dto.nombre_bottes !== undefined) {
      updatePayload.nombre_bottes = dto.nombre_bottes;
      updatePayload.nombre_paniers = dto.nombre_bottes;
    }

    if (dto.poids_moyen_botte !== undefined) {
      updatePayload.poids_moyen_botte = dto.poids_moyen_botte;
      updatePayload.poids_moyen_panier = dto.poids_moyen_botte;
    }

    if (dto.nombre_bottes !== undefined || dto.poids_moyen_botte !== undefined) {
      const current = await this.findOne(id);

      if (current) {
        const nombreBottes = dto.nombre_bottes ?? current.nombre_bottes ?? current.nombre_paniers;
        const poidsMoyenBotte = dto.poids_moyen_botte ?? current.poids_moyen_botte ?? current.poids_moyen_panier;
        updatePayload.stock_total_kg = nombreBottes * poidsMoyenBotte;
      }
    }

    if (dto.date) {
      updatePayload.date = new Date(dto.date);
    }

    await this.inventoryRepository.update(id, updatePayload);
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
      .select('SUM(COALESCE(inventory.nombre_bottes, inventory.nombre_paniers) * COALESCE(inventory.poids_moyen_botte, inventory.poids_moyen_panier))', 'total')
      .getRawOne();
    return result?.total ? parseFloat(result.total) : 0;
  }
}
