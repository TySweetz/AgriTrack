import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ClientEntity } from '../clients/client.entity';

/**
 * Entité Delivery
 * Représente une livraison d'asperges à un client
 */
@Entity('deliveries')
export class DeliveryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column('varchar', { length: 255, nullable: false })
  lieu!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  quantite_kg!: number;

  @ManyToOne(() => ClientEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @Column('uuid', { nullable: false })
  client_id!: string;
}
