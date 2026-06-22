import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

/**
 * Avis sur un produit. Reserve aux acheteurs ayant reellement recu une
 * commande contenant ce produit (achat verifie, comme Amazon).
 * Un seul avis par (produit, acheteur) — re-soumettre le met a jour.
 */
@Entity('reviews')
@Unique(['productId', 'acheteurId'])
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  productId!: string;

  @Column('uuid')
  acheteurId!: string;

  @Column('varchar', { length: 255 })
  acheteurNom!: string;

  @Column('smallint')
  note!: number;

  @Column('text', { nullable: true })
  commentaire?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
