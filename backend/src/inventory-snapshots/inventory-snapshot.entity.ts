import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entité InventorySnapshot
 * Représente la saisie du stock restant en fin de journée
 */
@Entity('inventory_snapshots')
export class InventorySnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('timestamptz', { nullable: false })
  date!: Date;

  @Column('decimal', { precision: 12, scale: 2, nullable: false })
  stock_restant_kg!: number;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}