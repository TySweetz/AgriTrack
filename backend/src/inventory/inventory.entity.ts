import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entité Inventory
 * Représente un stock d'asperges avec le nombre de bottes et le poids moyen
 */
@Entity('inventory')
export class InventoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('integer', { nullable: false, default: 0 })
  nombre_paniers!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 5 })
  poids_moyen_panier!: number;

  @Column('integer', { nullable: false, default: 0 })
  nombre_bottes!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 5 })
  poids_moyen_botte!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  stock_total_kg!: number;

  @Column('timestamptz', { nullable: false })
  date!: Date;
}
