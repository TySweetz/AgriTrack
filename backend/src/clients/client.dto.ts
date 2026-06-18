/**
 * DTO pour créer un client
 */
export class CreateClientDto {
  nom!: string;
  telephone?: string;
  adresse?: string;
}

/**
 * DTO pour mettre à jour un client
 */
export class UpdateClientDto {
  nom?: string;
  telephone?: string;
  adresse?: string;
}
