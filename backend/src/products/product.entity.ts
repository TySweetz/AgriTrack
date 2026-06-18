import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255 })
  nom!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  prix!: number;

  @Column('varchar', { length: 50, default: 'kg' })
  unite!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  stock!: number;

  @Column('varchar', { length: 100, default: 'Autre' })
  categorie!: string;

  @Column('varchar', { length: 100, default: 'Conventionnel' })
  label!: string;

  @Column('varchar', { nullable: true })
  photo?: string;

  @Column('boolean', { default: true })
  actif!: boolean;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendeurId' })
  vendeur!: UserEntity;

  @Column('uuid')
  vendeurId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
