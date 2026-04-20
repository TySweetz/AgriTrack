/**
 * DTO pour créer une livraison
 */
export class CreateDeliveryDto {
  date!: Date;
  lieu!: string;
  quantite_kg!: number;
  client_id!: string;
}

/**
 * DTO pour mettre à jour une livraison
 */
export class UpdateDeliveryDto {
  date?: Date;
  lieu?: string;
  quantite_kg?: number;
  client_id?: string;
}
