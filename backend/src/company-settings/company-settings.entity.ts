import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Parametres entreprise par vendeur (signature, TVA, SIRET)
 */
@Entity('company_settings')
export class CompanySettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { unique: true })
  vendeurId!: string;

  @Column('varchar', { length: 30, nullable: true })
  siret?: string;

  @Column('boolean', { default: false })
  assujetti_tva!: boolean;

  @Column('decimal', { precision: 5, scale: 2, default: 20 })
  taux_tva!: number;

  @Column('varchar', { length: 255, nullable: true })
  signature_file_path!: string | null;

  @Column('varchar', { length: 255, nullable: true })
  signature_file_name!: string | null;

  @Column('varchar', { length: 50, nullable: true })
  signature_mime_type!: string | null;

  @Column('integer', { nullable: true })
  signature_file_size!: number | null;

  @Column('boolean', { default: true })
  signature_enabled_delivery!: boolean;

  @Column('boolean', { default: true })
  signature_enabled_invoice!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
