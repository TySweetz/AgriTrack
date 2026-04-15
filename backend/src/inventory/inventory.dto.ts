/**
 * DTO pour créer un stock d'inventaire
 */
export class CreateInventoryDto {
  nombre_paniers!: number;
  poids_moyen_panier?: number; // Défaut 5
}

/**
 * DTO pour mettre à jour un stock d'inventaire
 */
export class UpdateInventoryDto {
  nombre_paniers?: number;
  poids_moyen_panier?: number;
}
