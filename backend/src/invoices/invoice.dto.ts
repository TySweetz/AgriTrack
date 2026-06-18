/**
 * DTO pour générer une facture mensuelle
 */
export class GenerateInvoiceDto {
  client_id!: string;
  period_start!: string | Date;
  period_end!: string | Date;
  prix_unitaire_kg!: number;
  taux_tva!: number;
}
