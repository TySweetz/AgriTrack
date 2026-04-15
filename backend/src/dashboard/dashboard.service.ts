import { Injectable } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { DeliveryService } from '../deliveries/delivery.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryEntity } from '../inventory/inventory.entity';

/**
 * Service pour la gestion du dashboard avec agrégats
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly deliveryService: DeliveryService,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
  ) {}

  /**
   * Récupère les données du dashboard
   */
  async getDashboardData() {
    const totalStockKg = await this.inventoryService.getTotalStock();
    const totalVendedKg = await this.deliveryService.getTotalDelivered();
    const recentDeliveries = await this.deliveryService.getRecent(5);

    // Calcul de la moyenne kg/panier
    const result = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('AVG(inventory.poids_moyen_panier)', 'avg')
      .getRawOne();
    const moyennePanier = result?.avg ? parseFloat(result.avg) : 0;

    return {
      total_stock_kg: totalStockKg,
      total_vendu_kg: totalVendedKg,
      moyenne_kg_panier: moyennePanier,
      livraisons_recentes: recentDeliveries,
      nombre_livraisons: recentDeliveries.length,
    };
  }
}
