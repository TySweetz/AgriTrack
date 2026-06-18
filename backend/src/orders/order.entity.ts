import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';

export enum OrderStatus {
  EN_ATTENTE = 'en_attente',
  ACCEPTEE = 'acceptee',
  REFUSEE = 'refusee',
  LIVREE = 'livree',
}

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'acheteurId' })
  acheteur!: UserEntity;

  @Column('uuid')
  acheteurId!: string;

  @Column('uuid')
  vendeurId!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.EN_ATTENTE })
  statut!: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total!: number;

  @Column('text', { nullable: true })
  adresseLivraison?: string;

  @Column('text', { nullable: true })
  message?: string;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { eager: true, cascade: true })
  items!: OrderItemEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: OrderEntity;

  @Column('uuid')
  orderId!: string;

  @Column('uuid')
  productId!: string;

  @Column('varchar', { length: 255 })
  nomProduit!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  prixUnitaire!: number;

  @Column('varchar', { length: 50, default: 'kg' })
  unite!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantite!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  sousTotal!: number;
}
