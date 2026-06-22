/**
 * DTO de mise a jour des parametres entreprise
 */
export class UpdateCompanySettingsDto {
  siret?: string;
  assujetti_tva?: boolean;
  taux_tva?: number;
  signature_enabled_delivery?: boolean;
  signature_enabled_invoice?: boolean;
}
