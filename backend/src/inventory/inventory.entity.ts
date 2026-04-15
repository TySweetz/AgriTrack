import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Entité Inventory
 * Représente un stock d'asperges avec le nombre de paniers et le poids moyen
 */
@Entity('inventory')
export class InventoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('integer', { nullable: false })
  nombre_paniers!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 5 })
  poids_moyen_panier!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  stock_total_kg!: number;

  @CreateDateColumn()
  date!: Date;
}
