/**
 * DTO pour créer un snapshot de stock du soir
 */
export class CreateInventorySnapshotDto {
  date!: string | Date;
  stock_restant_kg!: number;
  notes?: string;
}

/**
 * DTO pour mettre à jour un snapshot de stock du soir
 */
export class UpdateInventorySnapshotDto {
  date?: string | Date;
  stock_restant_kg?: number;
  notes?: string;
}