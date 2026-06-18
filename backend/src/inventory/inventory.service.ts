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
   * Récupère le dernier stock avant ou égal à la date donnée
   */
  async getLatestStockBeforeOrOn(date: Date) {
    return this.inventoryRepository.findOne({
      where: {},
      order: { date: 'DESC' },
    });
  }

  /**
   * Récupère ou crée l'entrée d'inventaire pour une date donnée
   */
  async getOrCreateInventoryForDate(date: Date) {
    // Normaliser la date à 00:00:00
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Chercher une entrée pour cette date exacte
    const existingInventory = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('DATE(inventory.date) = DATE(:date)', { date: normalizedDate })
      .orderBy('inventory.date', 'DESC')
      .getOne();

    if (existingInventory) {
      return existingInventory;
    }

    // Si pas d'entrée pour ce jour, récupérer le dernier stock et créer une nouvelle entrée
    const lastStock = await this.getLatestStockBeforeOrOn(normalizedDate);

    if (!lastStock) {
      // Pas de stock historique, créer une entrée vierge (stock initial = 0)
      return this.inventoryRepository.save(
        this.inventoryRepository.create({
          nombre_bottes: 0,
          poids_moyen_botte: 5,
          nombre_paniers: 0,
          poids_moyen_panier: 5,
          stock_total_kg: 0,
          date: normalizedDate,
        }),
      );
    }

    // Créer une nouvelle entrée avec le même stock que le dernier jour
    return this.inventoryRepository.save(
      this.inventoryRepository.create({
        nombre_bottes: lastStock.nombre_bottes,
        poids_moyen_botte: lastStock.poids_moyen_botte,
        nombre_paniers: lastStock.nombre_paniers,
        poids_moyen_panier: lastStock.poids_moyen_panier,
        stock_total_kg: lastStock.stock_total_kg,
        date: normalizedDate,
      }),
    );
  }

  /**
   * Décrémente le stock pour une livraison
   * Modifie l'entrée d'inventaire du jour en soustrayant la quantité
   */
  async decrementStockForDelivery(quantiteKg: number, deliveryDate: Date) {
    // Récupérer ou créer l'entrée d'inventaire pour cette date
    const inventoryForDate = await this.getOrCreateInventoryForDate(deliveryDate);

    // Calculer le nouveau stock
    const poidsMoyenBotte =
      inventoryForDate.poids_moyen_botte || inventoryForDate.poids_moyen_panier || 5;
    const nouveauStockKg = Math.max(0, inventoryForDate.stock_total_kg - quantiteKg);
    const nouveauNombreBottes = Math.round(nouveauStockKg / poidsMoyenBotte);

    // Mettre à jour l'entrée existante avec le nouveau stock
    await this.inventoryRepository.update(inventoryForDate.id, {
      nombre_bottes: nouveauNombreBottes,
      nombre_paniers: nouveauNombreBottes,
      stock_total_kg: nouveauStockKg,
    });

    return this.findOne(inventoryForDate.id);
  }

  /**
   * Restaure le stock après suppression d'une livraison
   */
  async incrementStockForDeletedDelivery(quantiteKg: number, deliveryDate: Date) {
    // Récupérer l'entrée d'inventaire pour cette date
    const inventoryForDate = await this.getOrCreateInventoryForDate(deliveryDate);

    if (!inventoryForDate) {
      return null;
    }

    const poidsMoyenBotte =
      inventoryForDate.poids_moyen_botte || inventoryForDate.poids_moyen_panier || 5;
    const nouveauStockKg = inventoryForDate.stock_total_kg + quantiteKg;
    const nouveauNombreBottes = Math.round(nouveauStockKg / poidsMoyenBotte);

    // Mettre à jour l'entrée avec le stock restauré
    await this.inventoryRepository.update(inventoryForDate.id, {
      nombre_bottes: nouveauNombreBottes,
      nombre_paniers: nouveauNombreBottes,
      stock_total_kg: nouveauStockKg,
    });

    return this.findOne(inventoryForDate.id);
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
