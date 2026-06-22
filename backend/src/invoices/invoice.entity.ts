import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export interface InvoiceLine {
  nomProduit: string;
  prixUnitaire: number;
  unite: string;
  quantite: number;
  sousTotal: number;
}

/**
 * Facture generee automatiquement a partir d'une commande acceptee.
 * Les lignes et informations sont figees (snapshot) au moment de la generation :
 * la facture ne doit pas changer si la commande, le profil acheteur ou vendeur changent ensuite.
 */
@Entity('invoices')
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 50, nullable: false, unique: true })
  numero_facture!: string;

  @Column('uuid', { unique: true })
  orderId!: string;

  @Column('uuid')
  vendeurId!: string;

  @Column('varchar', { length: 255 })
  vendeurNom!: string;

  @Column('varchar', { length: 30, nullable: true })
  vendeurSiret?: string;

  @Column('varchar', { length: 255 })
  acheteurNom!: string;

  @Column('text', { nullable: true })
  acheteurAdresse?: string;

  @Column('jsonb')
  items!: InvoiceLine[];

  @Column('boolean', { default: false })
  assujetti_tva!: boolean;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taux_tva!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  montant_ht!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  montant_tva!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  montant_ttc!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
