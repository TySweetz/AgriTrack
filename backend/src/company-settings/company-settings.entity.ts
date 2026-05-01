import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Parametres entreprise (singleton)
 */
@Entity('company_settings')
export class CompanySettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 150, nullable: true })
  company_name?: string;

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
