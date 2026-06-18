import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ClientEntity } from '../clients/client.entity';

/**
 * Entité Invoice
 * Représente une facture mensuelle générée à partir des livraisons
 */
@Entity('invoices')
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 50, nullable: false, unique: true })
  numero_facture!: string;

  @Column('varchar', { length: 20, nullable: false, default: 'DRAFT' })
  status!: string;

  @Column('timestamptz', { nullable: false })
  period_start!: Date;

  @Column('timestamptz', { nullable: false })
  period_end!: Date;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  total_kg!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  prix_unitaire_kg!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  montant_ht!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  taux_tva!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  montant_tva!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  montant_ttc!: number;

  @ManyToOne(() => ClientEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @Column('uuid', { nullable: false })
  client_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}