/**
 * DTO de mise a jour des parametres entreprise
 */
export class UpdateCompanySettingsDto {
  company_name?: string;
  signature_enabled_delivery?: boolean;
  signature_enabled_invoice?: boolean;
}
