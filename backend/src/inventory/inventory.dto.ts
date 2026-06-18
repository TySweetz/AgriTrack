/**
 * DTO pour créer un stock d'inventaire
 */
export class CreateInventoryDto {
  nombre_bottes!: number;
  poids_moyen_botte?: number; // Défaut 5
  date?: string | Date;
}

/**
 * DTO pour mettre à jour un stock d'inventaire
 */
export class UpdateInventoryDto {
  nombre_bottes?: number;
  poids_moyen_botte?: number;
  date?: string | Date;
}
